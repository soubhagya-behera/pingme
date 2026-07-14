package com.soubhagya.pingme.dto.response;

import lombok.*;

import java.time.LocalDateTime;

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

    private String senderEmail;

    private String senderProfession;

    private String senderProfilePicture;

    private Boolean senderOnline;

    private String receiverName;

    private String status;

    private LocalDateTime createdAt;

}