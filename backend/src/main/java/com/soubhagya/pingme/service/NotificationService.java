package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {

    List<NotificationResponse> getNotifications(String email);

    long getUnreadCount(String email);

    void markAsRead(Long notificationId, String email);

    void markAllRead(String email);

    void createFriendRequestNotification(
            Long recipientId,
            Long senderId,
            String senderName
    );

    void createFriendRequestAcceptedNotification(
            Long recipientId,
            Long accepterId,
            String accepterName
    );

    void createMessageNotification(
            Long recipientId,
            Long senderId,
            String senderName,
            String preview
    );

    void createMissedCallNotification(
            Long recipientId,
            Long callerId,
            String callerName,
            String callType
    );

}