package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.dto.response.NotificationResponse;
import com.soubhagya.pingme.entity.Notification;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.NotificationType;
import com.soubhagya.pingme.repository.NotificationRepository;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final NotificationRepository notificationRepository;

    private final UserRepository userRepository;

    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(String email) {

        User recipient = findUser(email);

        return notificationRepository
                .findByRecipientOrderByCreatedAtDesc(recipient)
                .stream()
                .map(this::toResponse)
                .toList();

    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {

        User recipient = findUser(email);

        return notificationRepository
                .countByRecipientAndReadFalse(recipient);

    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, String email) {

        User recipient = findUser(email);

        notificationRepository
                .findByIdAndRecipient(notificationId, recipient)
                .ifPresent(notification -> {

                    notification.setRead(true);

                    notificationRepository.save(notification);

                });

    }

    @Override
    @Transactional
    public void markAllRead(String email) {

        User recipient = findUser(email);

        List<Notification> unread =
                notificationRepository
                        .findByRecipientAndReadFalse(recipient);

        unread.forEach(notification ->
                notification.setRead(true)
        );

        notificationRepository.saveAll(unread);

    }

    @Override
    public void createFriendRequestNotification(
            Long recipientId,
            Long senderId,
            String senderName
    ) {

        create(
                recipientId,
                NotificationType.NEW_FRIEND_REQUEST,
                "New Friend Request",
                senderName + " sent you a friend request.",
                senderId
        );

    }

    @Override
    public void createFriendRequestAcceptedNotification(
            Long recipientId,
            Long accepterId,
            String accepterName
    ) {

        create(
                recipientId,
                NotificationType.FRIEND_REQUEST_ACCEPTED,
                "Friend Request Accepted",
                accepterName + " accepted your friend request.",
                accepterId
        );

    }

    @Override
    public void createMessageNotification(
            Long recipientId,
            Long senderId,
            String senderName,
            String preview
    ) {

        create(
                recipientId,
                NotificationType.NEW_MESSAGE,
                "New Message",
                senderName + ": " + preview,
                senderId
        );

    }

    @Override
    public void createMissedCallNotification(
            Long recipientId,
            Long callerId,
            String callerName,
            String callType
    ) {

        String title = "VOICE".equalsIgnoreCase(callType)
                ? "Missed Audio Call"
                : "Missed Video Call";

        String preview = "VOICE".equalsIgnoreCase(callType)
                ? "Missed audio call from " + callerName
                : "Missed video call from " + callerName;

        create(
                recipientId,
                NotificationType.MISSED_CALL,
                title,
                preview,
                callerId
        );

    }

    private void create(
            Long recipientId,
            NotificationType type,
            String title,
            String message,
            Long relatedUserId
    ) {

        User recipient = userRepository
                .findById(recipientId)
                .orElse(null);

        if (recipient == null) {
            log.warn("[NOTIFICATION] Skipped {} for missing recipientId={}", type, recipientId);
            return;
        }

        Notification notification =
                Notification.builder()
                        .recipient(recipient)
                        .type(type)
                        .title(title)
                        .message(message)
                        .relatedUserId(relatedUserId)
                        .read(false)
                        .createdAt(LocalDateTime.now())
                        .build();

        Notification saved =
                notificationRepository.save(notification);

        log.info("[NOTIFICATION] Persisted id={} type={} recipientId={} msg=\"{}\"",
                saved.getId(), type, recipientId, message);

        NotificationResponse response =
                toResponse(saved);

        afterCommit(() -> messagingTemplate
                .convertAndSend(
                        "/topic/notifications/" + recipientId,
                        response
                ));

    }

    private User findUser(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

    }

    private NotificationResponse toResponse(Notification notification) {

        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .relatedUserId(notification.getRelatedUserId())
                .read(Boolean.TRUE.equals(notification.getRead()))
                .createdAt(notification.getCreatedAt())
                .build();

    }

    private void afterCommit(Runnable action) {

        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            action.run();
            return;
        }

        TransactionSynchronizationManager
                .registerSynchronization(
                        new TransactionSynchronization() {
                            @Override
                            public void afterCommit() {
                                action.run();
                            }
                        }
                );

    }

}