package com.soubhagya.pingme.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRequestResponse {

    private Long requestId;

    private Long senderId;

    private Long receiverId;

    private String senderName;

    private String receiverName;

    private String status;

}