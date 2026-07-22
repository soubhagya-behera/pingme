package com.soubhagya.pingme.repository;

import com.soubhagya.pingme.entity.HiddenMessage;
import com.soubhagya.pingme.entity.Message;
import com.soubhagya.pingme.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

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

}