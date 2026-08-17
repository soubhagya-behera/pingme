package com.soubhagya.pingme.dto.chat;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CallSignal {

    private String callId;

    private Long callerId;

    private Long receiverId;

    private String callerName;

    private String callerProfilePicture;

    private String callType;

    private String event;

    private String sdp;

    private String candidate;

    private String status;

}