package com.soubhagya.pingme.repository;

import com.soubhagya.pingme.entity.FriendRequest;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.FriendRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FriendRequestRepository
        extends JpaRepository<FriendRequest,Long> {

    Optional<FriendRequest> findTopBySenderAndReceiverOrderByCreatedAtDesc(
        User sender,
        User receiver
);

    boolean existsBySenderAndReceiverAndStatus(
            User sender,
            User receiver,
            FriendRequestStatus status
    );

    List<FriendRequest> findByReceiverAndStatus(
        User receiver,
        FriendRequestStatus status
);

    @Query("""
            select fr from FriendRequest fr
            join fetch fr.sender
            join fetch fr.receiver
            where fr.receiver = :receiver and fr.status = :status
            order by fr.createdAt desc
            """)
    List<FriendRequest> findByReceiverAndStatusWithUsers(
            @Param("receiver") User receiver,
            @Param("status") FriendRequestStatus status);

    void deleteBySenderOrReceiver(User sender, User receiver);

    long countByReceiverAndStatus(
        User receiver,
        FriendRequestStatus status
);

 long countByReceiver(User receiver);

    long countByReceiverAndCreatedAtAfter(

            User receiver,

            LocalDateTime createdAt

    );

    long countBySender(User sender);

}
