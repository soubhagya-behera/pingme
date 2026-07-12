package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.dashboard.DashboardStatsCalculator;
import com.soubhagya.pingme.dto.response.DashboardStatsResponse;
import com.soubhagya.pingme.dto.websocket.DashboardUpdate;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.DashboardRealtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardRealtimeServiceImpl
        implements DashboardRealtimeService {

    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    private final DashboardStatsCalculator dashboardStatsCalculator;

    @Override
    public void sendDashboardUpdate(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow();

        DashboardStatsResponse stats = 
                dashboardStatsCalculator.calculate(user);

        DashboardUpdate update =
                DashboardUpdate.builder()
                        .totalFriends(stats.getTotalFriends())
                        .onlineFriends(stats.getOnlineFriends())
                        .pendingRequests(stats.getPendingRequests())
                        .unreadMessages(stats.getUnreadMessages())
                        .build();

        messagingTemplate.convertAndSend(
                "/topic/dashboard/" + userId,
                update
        );
    }
}