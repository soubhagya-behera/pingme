package com.soubhagya.pingme.dto.websocket;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendSocketEvent {

    private Long userId;

    private Long friendId;

    private String type;

}