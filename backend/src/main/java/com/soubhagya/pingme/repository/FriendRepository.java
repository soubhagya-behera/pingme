package com.soubhagya.pingme.repository;

import com.soubhagya.pingme.entity.Friend;
import com.soubhagya.pingme.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FriendRepository extends JpaRepository<Friend,Long> {

    boolean existsByUserOneAndUserTwo(
            User userOne,
            User userTwo
    );

    List<Friend> findByUserOne(User user);

    List<Friend> findByUserTwo(User user);

}