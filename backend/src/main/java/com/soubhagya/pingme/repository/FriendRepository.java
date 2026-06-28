package com.soubhagya.pingme.repository;

import com.soubhagya.pingme.entity.Friend;
import com.soubhagya.pingme.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FriendRepository extends JpaRepository<Friend,Long> {

    boolean existsByUserOneAndUserTwo(
            User userOne,
            User userTwo
    );

}