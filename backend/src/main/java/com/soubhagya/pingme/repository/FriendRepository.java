package com.soubhagya.pingme.repository;

import com.soubhagya.pingme.entity.Friend;
import com.soubhagya.pingme.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

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

    void deleteByUserOneOrUserTwo(User userOne, User userTwo);


    long countByUserOne(User user);

long countByUserTwo(User user);

Optional<Friend> findByUserOneAndUserTwoOrUserOneAndUserTwo(

        User userOne,

        User userTwo,

        User userThree,

        User userFour

);
}
