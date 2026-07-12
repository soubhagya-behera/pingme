package com.soubhagya.pingme.dashboard;

import com.soubhagya.pingme.dto.response.DashboardStatsResponse;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.FriendRequestStatus;
import com.soubhagya.pingme.enums.MessageStatus;
import com.soubhagya.pingme.repository.FriendRepository;
import com.soubhagya.pingme.repository.FriendRequestRepository;
import com.soubhagya.pingme.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DashboardStatsCalculator {

    private final FriendRepository friendRepository;

    private final FriendRequestRepository friendRequestRepository;

    private final MessageRepository messageRepository;

    public DashboardStatsResponse calculate(User user) {

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
                friendRepository.findByUserOne(user)
                        .stream()
                        .map(friend -> friend.getUserTwo())
                        .filter(User::getOnline)
                        .count();

        onlineFriends +=
                friendRepository.findByUserTwo(user)
                        .stream()
                        .map(friend -> friend.getUserOne())
                        .filter(User::getOnline)
                        .count();

        return DashboardStatsResponse.builder()

                .totalFriends(totalFriends)

                .onlineFriends(onlineFriends)

                .pendingRequests(pendingRequests)

                .unreadMessages(unreadMessages)

                .build();

    }

}