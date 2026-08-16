package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.response.NotificationResponse;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.NotificationType;

import java.util.List;

public interface NotificationService {

    List<NotificationResponse> getNotifications(String email);

    long getUnreadCount(String email);

    void markAsRead(Long id, String email);

    void markAllAsRead(String email);

    void createNotification(
            User recipient,
            NotificationType type,
            String title,
            String message,
            Long relatedUserId
    );

}