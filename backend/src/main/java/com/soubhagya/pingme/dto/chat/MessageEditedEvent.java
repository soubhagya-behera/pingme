package com.soubhagya.pingme.dto.chat;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageEditedEvent {

    private Long messageId;

    private String content;

    private Boolean edited;

    private LocalDateTime editedAt;

}