package com.soubhagya.pingme.repository;

import com.soubhagya.pingme.entity.Friend;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FriendRepository
        extends JpaRepository<Friend, Long> {
}