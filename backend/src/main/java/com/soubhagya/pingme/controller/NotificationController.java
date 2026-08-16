package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.dto.response.NotificationResponse;
import com.soubhagya.pingme.payload.ApiResponse;
import com.soubhagya.pingme.service.NotificationService;
import com.soubhagya.pingme.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>>
    getNotifications(Authentication authentication) {

        return ResponseEntity.ok(

                ResponseUtil.success(

                        "Notifications",

                        notificationService.getNotifications(
                                authentication.getName()
                        )

                )

        );

    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            Authentication authentication) {

        return ResponseEntity.ok(

                ResponseUtil.success(

                        "Unread Count",

                        notificationService.getUnreadCount(
                                authentication.getName()
                        )

                )

        );

    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {

        notificationService.markAsRead(
                id,
                authentication.getName()
        );

        return ResponseEntity.ok(

                ResponseUtil.success(
                        "Notification marked as read",
                        null
                )

        );

    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(
            Authentication authentication) {

        notificationService.markAllRead(
                authentication.getName()
        );

        return ResponseEntity.ok(

                ResponseUtil.success(
                        "All notifications marked as read",
                        null
                )

        );

    }

}