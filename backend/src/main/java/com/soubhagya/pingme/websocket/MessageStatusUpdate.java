package com.soubhagya.pingme.websocket;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageStatusUpdate {

    private Long messageId;

    private String status;

}