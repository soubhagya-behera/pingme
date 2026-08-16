package com.soubhagya.pingme.dto.response;

import com.soubhagya.pingme.enums.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private Long id;

    private NotificationType type;

    private String title;

    private String message;

    private Long relatedUserId;

    private boolean read;

    private LocalDateTime createdAt;

}