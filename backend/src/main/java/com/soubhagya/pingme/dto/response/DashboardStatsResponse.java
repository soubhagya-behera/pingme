package com.soubhagya.pingme.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    private long totalFriends;

    private long onlineFriends;

    private long pendingRequests;

    private long unreadMessages;

}