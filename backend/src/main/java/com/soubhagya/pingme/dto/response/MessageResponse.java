package com.soubhagya.pingme.dto.response;

import lombok.*;

import java.time.LocalDateTime;

import com.soubhagya.pingme.dto.chat.ReplyPreview;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {

    private Long id;

    private Long senderId;

    private Long receiverId;

    private String content;

    private String messageType;

    private String status;

    private LocalDateTime sentAt;

    private ReplyPreview reply;

    private Boolean edited;

private LocalDateTime editedAt;

}