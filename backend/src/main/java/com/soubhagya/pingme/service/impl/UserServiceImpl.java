package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.UserStatus;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.UserService;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

import com.soubhagya.pingme.dto.response.UserSearchResponse;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.dto.request.PasswordChangeRequest;
import com.soubhagya.pingme.dto.request.UpdateProfileRequest;
import com.soubhagya.pingme.dto.response.ProfileResponse;

import com.soubhagya.pingme.entity.FriendRequest;
import com.soubhagya.pingme.enums.RelationshipStatus;
import com.soubhagya.pingme.repository.FriendRepository;
import com.soubhagya.pingme.repository.FriendRequestRepository;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final FriendRepository friendRepository;

private final FriendRequestRepository friendRequestRepository;

private final PasswordEncoder passwordEncoder;

    @Override
    public List<User> getAllUsers() {

        return userRepository.findAll();

    }

 @Override
public List<UserSearchResponse> searchUsers(

        String keyword,

        String loggedInEmail

) {

    User currentUser = userRepository

            .findByEmail(loggedInEmail)

            .orElseThrow(() ->

                    new RuntimeException(

                            "User not found"

                    )

            );

    List<User> users =

            userRepository.searchUsers(

                    currentUser.getId(),

                    keyword

            );

    return users.stream()

            .map(user -> {

                RelationshipStatus relationshipStatus;

Long requestId = null;

                boolean areFriends =

                        friendRepository

                                .existsByUserOneAndUserTwoOrUserOneAndUserTwo(

                                        currentUser,

                                        user,

                                        user,

                                        currentUser

                                );

                if (areFriends) {

                    relationshipStatus =

                            RelationshipStatus.FRIENDS;

                }

                else {

                    FriendRequest sentRequest =
        friendRequestRepository
                .findTopBySenderAndReceiverOrderByCreatedAtDesc(
                        currentUser,
                        user
                )
                .orElse(null);

                    FriendRequest receivedRequest =
        friendRequestRepository
                .findTopBySenderAndReceiverOrderByCreatedAtDesc(
                        user,
                        currentUser
                )
                .orElse(null);

                    if (sentRequest != null) {

    relationshipStatus = RelationshipStatus.PENDING_SENT;

    requestId = sentRequest.getId();

}

else if (receivedRequest != null) {

    relationshipStatus = RelationshipStatus.PENDING_RECEIVED;

    requestId = receivedRequest.getId();

}

else {

    relationshipStatus = RelationshipStatus.NOT_FRIEND;

}

                }

                return UserSearchResponse.builder()

        .id(user.getId())

        .fullName(user.getFullName())

        .email(user.getEmail())

        .profession(user.getProfession())

        .profilePicture(user.getProfilePicture())

        .online(user.getOnline())

        .relationshipStatus(

                relationshipStatus

        )

        .requestId(requestId)

        .build();

            })

            .toList();

}

@Override
public ProfileResponse getProfile(String email) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    return ProfileResponse.builder()
            .id(user.getId())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .profession(user.getProfession())
            .bio(user.getBio())
            .phone(user.getPhone())
            .profilePicture(user.getProfilePicture())
            .build();

}

@Override
public ProfileResponse updateProfile(

        String email,

        UpdateProfileRequest request) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    user.setFullName(request.getFullName());

    user.setProfession(request.getProfession());

    user.setBio(request.getBio());

    user.setPhone(request.getPhone());

    User savedUser = userRepository.save(user);

    return ProfileResponse.builder()
            .id(savedUser.getId())
            .fullName(savedUser.getFullName())
            .email(savedUser.getEmail())
            .profession(savedUser.getProfession())
            .bio(savedUser.getBio())
            .phone(savedUser.getPhone())
            .profilePicture(savedUser.getProfilePicture())
            .build();

}

@Override
public void changePassword(
        String email,
        PasswordChangeRequest request
) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    if (!passwordEncoder.matches(
            request.getCurrentPassword(),
            user.getPassword())) {

        throw new RuntimeException(
                "Current password is incorrect");
    }

    if (!request.getNewPassword()
            .equals(request.getConfirmPassword())) {

        throw new RuntimeException(
                "Passwords do not match");
    }

    if (request.getNewPassword().length() < 8) {

        throw new RuntimeException(
                "Password must be at least 8 characters");
    }

    user.setPassword(

            passwordEncoder.encode(
                    request.getNewPassword())

    );

    userRepository.save(user);

}

}