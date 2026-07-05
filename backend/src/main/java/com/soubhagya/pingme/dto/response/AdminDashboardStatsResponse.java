package com.soubhagya.pingme.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardStatsResponse {

    private long totalUsers;

    private long pendingUsers;

    private long approvedUsers;

    private long rejectedUsers;

    private long suspendedUsers;

    private long onlineUsers;

}
