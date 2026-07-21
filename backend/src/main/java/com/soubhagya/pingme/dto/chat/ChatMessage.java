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

    // ⭐ NEW
    private String clientId;

    private Long senderId;

    private Long receiverId;

    private String content;

    private LocalDateTime sentAt;

    private String status;

    private Long replyToId;

    private ReplyPreview reply;

    private Boolean edited;

private LocalDateTime editedAt;

private Boolean deletedForEveryone;

private LocalDateTime deletedAt;

}