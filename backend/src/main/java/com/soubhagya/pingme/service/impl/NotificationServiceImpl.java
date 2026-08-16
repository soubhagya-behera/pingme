package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.dto.response.NotificationResponse;
import com.soubhagya.pingme.dto.websocket.NotificationSocketEvent;
import com.soubhagya.pingme.entity.Notification;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.NotificationType;
import com.soubhagya.pingme.repository.NotificationRepository;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    private final UserRepository userRepository;

    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(String email) {

        User recipient = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return notificationRepository
                .findByRecipientOrderByCreatedAtDesc(recipient)
                .stream()
                .map(this::toResponse)
                .toList();

    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {

        User recipient = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return notificationRepository
                .countByRecipientAndReadFalse(recipient);

    }

    @Override
    @Transactional
    public void markAsRead(Long id, String email) {

        User recipient = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Notification notification =
                notificationRepository
                        .findByIdAndRecipient(id, recipient)
                        .orElseThrow(() ->
                                new RuntimeException("Notification not found"));

        if (Boolean.TRUE.equals(notification.getRead())) {
            return;
        }

        notification.setRead(true);

        notificationRepository.save(notification);

    }

    @Override
    @Transactional
    public void markAllAsRead(String email) {

        User recipient = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        notificationRepository.markAllAsRead(recipient);

    }

    @Override
    public void createNotification(
            User recipient,
            NotificationType type,
            String title,
            String message,
            Long relatedUserId
    ) {

        Notification notification =
                Notification.builder()
                        .recipient(recipient)
                        .type(type)
                        .title(title)
                        .message(message)
                        .relatedUserId(relatedUserId)
                        .build();

        Notification saved =
                notificationRepository.save(notification);

        messagingTemplate.convertAndSend(
                "/topic/notifications/" + recipient.getId(),
                NotificationSocketEvent.builder()
                        .notificationId(saved.getId())
                        .type(type.name())
                        .build()
        );

    }

    private NotificationResponse toResponse(Notification notification) {

        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType().name())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .read(notification.getRead())
                .createdAt(notification.getCreatedAt())
                .relatedUserId(notification.getRelatedUserId())
                .build();

    }

}