package com.soubhagya.pingme.dto.websocket;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSocketEvent {

    private Long notificationId;

    private String type;

}