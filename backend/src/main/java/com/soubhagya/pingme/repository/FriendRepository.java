package com.soubhagya.pingme.repository;

import com.soubhagya.pingme.entity.Friend;
import com.soubhagya.pingme.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FriendRepository extends JpaRepository<Friend, Long> {

    // Find friends
    List<Friend> findByUserOne(User user);

    List<Friend> findByUserTwo(User user);

    // Check friendship in one direction
    boolean existsByUserOneAndUserTwo(
            User userOne,
            User userTwo
    );

    // Check friendship in both directions
    boolean existsByUserOneAndUserTwoOrUserOneAndUserTwo(
            User userOne,
            User userTwo,
            User userThree,
            User userFour
    );

}