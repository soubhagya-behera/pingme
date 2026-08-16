package com.soubhagya.pingme.websocket;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatusMessage {

    private Long userId;

    private String fullName;

    private boolean online;

    private LocalDateTime lastSeen;

}