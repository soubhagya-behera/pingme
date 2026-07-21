package com.soubhagya.pingme.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDeletedEvent {

    private Long messageId;

    private Boolean deletedForEveryone;

    private LocalDateTime deletedAt;

}