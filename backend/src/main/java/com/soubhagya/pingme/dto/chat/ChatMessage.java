package com.soubhagya.pingme.dto.chat;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    private Long id;

    private Long senderId;

    private Long receiverId;

    private String content;

    private LocalDateTime sentAt;

}