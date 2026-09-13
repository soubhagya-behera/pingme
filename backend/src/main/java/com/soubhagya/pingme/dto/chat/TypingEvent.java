package com.soubhagya.pingme.dto.chat;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TypingEvent {

    // H2: explicit identity — sender is who is typing, receiver is who receives
    private Long senderId;

    private Long receiverId;

    private boolean typing;

}