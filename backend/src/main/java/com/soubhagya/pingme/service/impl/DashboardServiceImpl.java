package com.soubhagya.pingme.service.impl;

import java.util.List;

import com.soubhagya.pingme.dashboard.DashboardStatsCalculator;
import com.soubhagya.pingme.dto.response.DashboardResponse;
import com.soubhagya.pingme.dto.response.DashboardStatsResponse;
import com.soubhagya.pingme.dto.response.FriendRequestResponse;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.FriendRequestStatus;
import com.soubhagya.pingme.repository.FriendRepository;
import com.soubhagya.pingme.repository.FriendRequestRepository;
import com.soubhagya.pingme.repository.MessageRepository;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.DashboardService;
import com.soubhagya.pingme.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;

    private final FriendRepository friendRepository;

    private final FriendRequestRepository friendRequestRepository;

    private final MessageRepository messageRepository;

    private final MessageService messageService;

    private final DashboardStatsCalculator dashboardStatsCalculator;

    @Override
    public DashboardResponse getDashboard(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DashboardStatsResponse stats = dashboardStatsCalculator.calculate(user);

        return DashboardResponse.builder()
                .stats(stats)
                .recentChats(messageService.getRecentChats(email))
                .pendingRequests(getPendingRequests(user))
                .build();

    }

    private List<FriendRequestResponse> getPendingRequests(User user) {

        return friendRequestRepository
                .findByReceiverAndStatus(
                        user,
                        FriendRequestStatus.PENDING
                )
                .stream()
                .map(request -> FriendRequestResponse.builder()
                        .requestId(request.getId())
                        .senderId(request.getSender().getId())
                        .receiverId(request.getReceiver().getId())
                        .senderName(request.getSender().getFullName())
                        .receiverName(request.getReceiver().getFullName())
                        .status(request.getStatus().name())
                        .build())
                .toList();

    }
}