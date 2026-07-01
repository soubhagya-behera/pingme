package com.soubhagya.pingme.websocket;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatusMessage {

    private Long userId;

    private String fullName;

    private boolean online;

}