package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.dto.response.AdminDashboardStatsResponse;
import com.soubhagya.pingme.dto.response.AdminUserPageResponse;
import com.soubhagya.pingme.dto.response.UserResponse;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.UserRole;
import com.soubhagya.pingme.enums.UserStatus;
import com.soubhagya.pingme.repository.FriendRepository;
import com.soubhagya.pingme.repository.FriendRequestRepository;
import com.soubhagya.pingme.repository.MessageRepository;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.AdminService;
import com.soubhagya.pingme.service.EmailService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import com.soubhagya.pingme.entity.PasswordResetToken;
import com.soubhagya.pingme.service.TokenService;
import com.soubhagya.pingme.service.EmailService;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;

    private final MessageRepository messageRepository;

    private final FriendRequestRepository friendRequestRepository;

    private final FriendRepository friendRepository;

    private final TokenService tokenService;

    private final EmailService emailService;

    @Override
    public AdminDashboardStatsResponse getDashboardStats() {

        return AdminDashboardStatsResponse.builder()
                .totalUsers(userRepository.countByRole(UserRole.USER))
                .pendingUsers(userRepository.countByStatusAndRole(UserStatus.PENDING, UserRole.USER))
                .approvedUsers(userRepository.countByStatusAndRole(UserStatus.APPROVED, UserRole.USER))
                .rejectedUsers(userRepository.countByStatusAndRole(UserStatus.REJECTED, UserRole.USER))
                .suspendedUsers(userRepository.countByStatusAndRole(UserStatus.SUSPENDED, UserRole.USER))
                .onlineUsers(userRepository.countByOnlineTrueAndRole(UserRole.USER))
                .build();

    }

    @Override
    public AdminUserPageResponse getUsers(String status, String search, int page, int size) {

        UserStatus userStatus = parseStatus(status);
        String normalizedSearch = normalizeSearch(search);
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        Pageable pageable = PageRequest.of(
                safePage,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<User> users = userRepository.findAll(
                buildUserSpecification(userStatus, normalizedSearch),
                pageable
        );

        return AdminUserPageResponse.builder()
                .users(users.getContent().stream()
                        .map(this::toUserResponse)
                        .collect(Collectors.toList()))
                .page(users.getNumber())
                .size(users.getSize())
                .totalElements(users.getTotalElements())
                .totalPages(users.getTotalPages())
                .first(users.isFirst())
                .last(users.isLast())
                .build();

    }

    @Override
    public List<UserResponse> getPendingUsers() {

        List<User> users = userRepository.findByStatus(UserStatus.PENDING);

        return users.stream()
                .filter(user -> user.getRole() == UserRole.USER)
                .map(this::toUserResponse)
                .collect(Collectors.toList());

    }

    @Override
    public UserResponse getUserById(Long id) {

        return toUserResponse(getManagedUser(id));

    }

  @Override
@Transactional
public UserResponse approveUser(Long id) {

    User user = getManagedUser(id);

    user.setStatus(UserStatus.APPROVED);

    User updatedUser = userRepository.save(user);

    PasswordResetToken token =
            tokenService.createToken(updatedUser);

    emailService.sendActivationEmail(

            updatedUser,

            token.getToken()

    );

    return toUserResponse(updatedUser);

}

    @Override
    @Transactional
    public UserResponse rejectUser(Long id) {

        User user = getManagedUser(id);

        user.setStatus(UserStatus.REJECTED);

        return toUserResponse(userRepository.save(user));

    }

    @Override
    @Transactional
    public void deleteUser(Long id) {

        User user = getManagedUser(id);

        messageRepository.deleteBySenderOrReceiver(user, user);
        friendRequestRepository.deleteBySenderOrReceiver(user, user);
        friendRepository.deleteByUserOneOrUserTwo(user, user);
        userRepository.delete(user);

    }

    private User getManagedUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() == UserRole.ADMIN) {
            throw new IllegalArgumentException("Admin accounts cannot be managed from user administration");
        }

        return user;

    }

    private UserStatus parseStatus(String status) {

        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
            return null;
        }

        try {
            return UserStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid user status filter");
        }

    }

    private String normalizeSearch(String search) {

        if (search == null || search.isBlank()) {
            return null;
        }

        return search.trim();

    }

    private Specification<User> buildUserSpecification(UserStatus status, String search) {

        return (root, query, criteriaBuilder) -> {

            var predicate = criteriaBuilder.equal(root.get("role"), UserRole.USER);

            if (status != null) {
                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.equal(root.get("status"), status)
                );
            }

            if (search != null) {
                String pattern = "%" + search.toLowerCase() + "%";

                var fullNamePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("fullName")),
                        pattern
                );

                var emailPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("email")),
                        pattern
                );

                var professionPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("profession")),
                        pattern
                );

                predicate = criteriaBuilder.and(
                        predicate,
                        criteriaBuilder.or(
                                fullNamePredicate,
                                emailPredicate,
                                professionPredicate
                        )
                );
            }

            return predicate;

        };

    }

    private UserResponse toUserResponse(User user) {

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .profession(user.getProfession())
                .bio(user.getBio())
                .phone(user.getPhone())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .online(user.getOnline())
                .emailVerified(user.getEmailVerified())
                .mustChangePassword(user.getMustChangePassword())
                .profilePicture(user.getProfilePicture())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .updatedAt(user.getUpdatedAt() != null ? user.getUpdatedAt().toString() : null)
                .lastSeen(user.getLastSeen() != null ? user.getLastSeen().toString() : null)
                .build();

    }

}
