package com.soubhagya.pingme.repository;

import com.soubhagya.pingme.entity.Message;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.MessageStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MessageRepository
        extends JpaRepository<Message, Long> {

    @Query("""
SELECT m
FROM Message m
WHERE
(m.sender = :user1 AND m.receiver = :user2)

OR

(m.sender = :user2 AND m.receiver = :user1)

ORDER BY m.sentAt ASC
""")
List<Message> getConversation(

        @Param("user1") User user1,

        @Param("user2") User user2

);

@Query("""
SELECT m
FROM Message m
WHERE

m.sender = :user

OR

m.receiver = :user

ORDER BY m.sentAt DESC
""")
List<Message> findRecentMessages(

        @Param("user") User user

);

List<Message> findBySenderAndReceiverAndStatus(
        User sender,
        User receiver,
        MessageStatus status
);

void deleteBySenderOrReceiver(User sender, User receiver);

}
