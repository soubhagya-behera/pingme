package com.soubhagya.pingme.repository;

import com.soubhagya.pingme.entity.FriendRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FriendRequestRepository
        extends JpaRepository<FriendRequest,Long> {
}