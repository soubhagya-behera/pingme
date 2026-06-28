package com.soubhagya.pingme.dto.chat;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    private Long senderId;

    private Long receiverId;

    private String content;

}