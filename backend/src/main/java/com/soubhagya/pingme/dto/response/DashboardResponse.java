package com.soubhagya.pingme.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {

    private DashboardStatsResponse stats;

    private List<RecentChatResponse> recentChats;

    private List<FriendRequestResponse> pendingRequests;

}