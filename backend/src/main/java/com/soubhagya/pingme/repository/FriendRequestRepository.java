package com.soubhagya.pingme.repository;

import com.soubhagya.pingme.entity.FriendRequest;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.FriendRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FriendRequestRepository
        extends JpaRepository<FriendRequest,Long> {

    Optional<FriendRequest> findBySenderAndReceiver(
            User sender,
            User receiver
    );

    boolean existsBySenderAndReceiverAndStatus(
            User sender,
            User receiver,
            FriendRequestStatus status
    );

}