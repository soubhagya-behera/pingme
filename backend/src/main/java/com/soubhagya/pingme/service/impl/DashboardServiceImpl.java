package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.dto.response.*;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.FriendRequestStatus;
import com.soubhagya.pingme.enums.MessageStatus;
import com.soubhagya.pingme.repository.FriendRepository;
import com.soubhagya.pingme.repository.FriendRequestRepository;
import com.soubhagya.pingme.repository.MessageRepository;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.DashboardService;
import com.soubhagya.pingme.service.FriendRequestService;
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

    private final FriendRequestService friendRequestService;

    @Override
    public DashboardResponse getDashboard(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long totalFriends =
                friendRepository.countByUserOne(user)
                        + friendRepository.countByUserTwo(user);

        long pendingRequests =
                friendRequestRepository.countByReceiverAndStatus(
                        user,
                        FriendRequestStatus.PENDING
                );

        long unreadMessages =
                messageRepository.countByReceiverAndStatus(
                        user,
                        MessageStatus.DELIVERED
                );

        long onlineFriends =
                friendRequestService
                        .getFriends(email)
                        .stream()
                        .filter(FriendResponse::getOnline)
                        .count();

        DashboardStatsResponse stats =
                DashboardStatsResponse.builder()
                        .totalFriends(totalFriends)
                        .onlineFriends(onlineFriends)
                        .pendingRequests(pendingRequests)
                        .unreadMessages(unreadMessages)
                        .build();

        return DashboardResponse.builder()
                .stats(stats)
                .recentChats(messageService.getRecentChats(email))
                .pendingRequests(friendRequestService.getIncomingRequests(email))
                .build();

    }
}