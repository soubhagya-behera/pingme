package com.soubhagya.pingme.repository;

import com.soubhagya.pingme.entity.Notification;
import com.soubhagya.pingme.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    @Query("""
            select n from Notification n
            join fetch n.recipient
            where n.recipient = :recipient
            order by n.createdAt desc
            """)
    List<Notification> findByRecipientOrderByCreatedAtDesc(
            @Param("recipient") User recipient);

    long countByRecipientAndReadFalse(User recipient);

    Optional<Notification> findByIdAndRecipient(Long id, User recipient);

    @Modifying
    @Query("""
            update Notification n
            set n.read = true
            where n.recipient = :recipient and n.read = false
            """)
    void markAllAsRead(@Param("recipient") User recipient);

    void deleteByRecipient(User recipient);

}