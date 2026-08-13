package com.soubhagya.pingme.repository;

import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.UserRole;
import com.soubhagya.pingme.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import org.springframework.transaction.annotation.Transactional;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    Optional<User> findByRole(UserRole role);

    boolean existsByEmail(String email);

    List<User> findByStatus(UserStatus status);

    long countByRole(UserRole role);

    long countByStatusAndRole(UserStatus status, UserRole role);

    long countByOnlineTrueAndRole(UserRole role);

    @Query("""

SELECT u

FROM User u

WHERE

u.status = :approvedStatus

AND

u.role = :userRole

AND

u.id <> :currentUserId

AND NOT EXISTS (
    SELECT 1 FROM Friend f
    WHERE (f.userOne.id = :currentUserId AND f.userTwo = u)
       OR (f.userTwo.id = :currentUserId AND f.userOne = u)
)

AND NOT EXISTS (
    SELECT 1 FROM FriendRequest fr
    WHERE fr.status = :pendingStatus
      AND ((fr.sender.id = :currentUserId AND fr.receiver = u)
        OR (fr.receiver.id = :currentUserId AND fr.sender = u))
)

AND

(

LOWER(u.fullName)

LIKE LOWER(CONCAT('%',:keyword,'%'))

OR

LOWER(u.email)

LIKE LOWER(CONCAT('%',:keyword,'%'))

)

ORDER BY u.fullName

""")
List<User> searchUsers(

        @Param("currentUserId") Long currentUserId,

        @Param("approvedStatus") UserStatus approvedStatus,

        @Param("userRole") UserRole userRole,

        @Param("pendingStatus") com.soubhagya.pingme.enums.FriendRequestStatus pendingStatus,

        @Param("keyword") String keyword

);

@Modifying
@Transactional
@Query("UPDATE User u SET u.online = false")
void resetAllUsersOffline();

}
