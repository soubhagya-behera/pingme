package com.soubhagya.pingme.websocket;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TypingMessage {

    private Long receiverId;

    private String senderName;

    private boolean typing;

}