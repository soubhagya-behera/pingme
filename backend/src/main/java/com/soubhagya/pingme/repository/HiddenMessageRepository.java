package com.soubhagya.pingme.repository;

import com.soubhagya.pingme.entity.HiddenMessage;
import com.soubhagya.pingme.entity.Message;
import com.soubhagya.pingme.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface HiddenMessageRepository
        extends JpaRepository<HiddenMessage, Long> {

    boolean existsByMessageAndUser(
            Message message,
            User user
    );

    Optional<HiddenMessage> findByMessageAndUser(
            Message message,
            User user
    );

    void deleteByMessage(Message message);

    void deleteByUser(User user);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM HiddenMessage hm WHERE hm.message.id IN (SELECT m.id FROM Message m WHERE m.sender = :user OR m.receiver = :user)")
    void deleteByMessageSenderOrReceiver(@Param("user") User user);

}