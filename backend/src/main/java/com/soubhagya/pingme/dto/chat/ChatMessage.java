package com.soubhagya.pingme.dto.chat;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;



@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    private Long id;

    @Size(max = 36, message = "clientId must be at most 36 characters")
    private String clientId;

    private Long senderId;

    @NotNull(message = "receiverId is required")
    @Positive(message = "receiverId must be positive")
    private Long receiverId;

    @Size(max = 4000, message = "Message content must be at most 4000 characters")
    private String content;

    @JsonAlias("imageUrl")
    @Size(max = 512, message = "attachmentUrl must be at most 512 characters")
    private String attachmentUrl;

    @Size(max = 255, message = "attachmentName must be at most 255 characters")
    private String attachmentName;

    private Long attachmentSize;

    @Size(max = 128, message = "attachmentMimeType must be at most 128 characters")
    private String attachmentMimeType;

    private Long attachmentDuration;

    @Size(max = 20, message = "messageType must be at most 20 characters")
    private String messageType;

    private LocalDateTime sentAt;

    private String status;

    private Long replyToId;

    private ReplyPreview reply;

    private Boolean edited;

private LocalDateTime editedAt;

private Boolean deletedForEveryone;

private LocalDateTime deletedAt;

private Boolean forwarded;
}
