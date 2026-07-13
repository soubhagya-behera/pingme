package com.soubhagya.pingme.dto.websocket;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRequestSocketEvent {

    private Long requestId;

    private Long senderId;

    private String senderName;

    private String senderProfilePicture;

    private String type;

}