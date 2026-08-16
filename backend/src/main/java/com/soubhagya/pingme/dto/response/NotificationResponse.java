package com.soubhagya.pingme.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private Long id;

    private String type;

    private String title;

    private String message;

    private Boolean read;

    private LocalDateTime createdAt;

    private Long relatedUserId;

}