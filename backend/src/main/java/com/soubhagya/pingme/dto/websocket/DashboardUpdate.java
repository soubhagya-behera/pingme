package com.soubhagya.pingme.dto.websocket;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardUpdate {

    private long totalFriends;

    private long onlineFriends;

    private long pendingRequests;

    private long unreadMessages;

}