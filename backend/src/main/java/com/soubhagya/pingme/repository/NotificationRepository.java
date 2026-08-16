package com.soubhagya.pingme.repository;

import com.soubhagya.pingme.entity.Notification;
import com.soubhagya.pingme.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientOrderByCreatedAtDesc(
            User recipient
    );

    long countByRecipientAndReadFalse(User recipient);

    Optional<Notification> findByIdAndRecipient(
            Long id,
            User recipient
    );

    List<Notification> findByRecipientAndReadFalse(User recipient);

    void deleteByRecipient(User recipient);

}