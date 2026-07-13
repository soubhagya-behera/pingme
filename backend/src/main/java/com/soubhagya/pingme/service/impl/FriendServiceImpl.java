package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.dto.response.FriendResponse;
import com.soubhagya.pingme.entity.Friend;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.repository.FriendRepository;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.soubhagya.pingme.dto.websocket.FriendSocketEvent;
import com.soubhagya.pingme.service.DashboardRealtimeService;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FriendServiceImpl implements FriendService {

    private final FriendRepository friendRepository;

    private final UserRepository userRepository;

    private final SimpMessagingTemplate messagingTemplate;

private final DashboardRealtimeService dashboardRealtimeService;

    @Override
    public List<FriendResponse> getFriends(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<FriendResponse> friends = new ArrayList<>();

        List<Friend> userOneFriends =
                friendRepository.findByUserOne(user);

        for (Friend friend : userOneFriends) {

            User f = friend.getUserTwo();

            friends.add(

                    FriendResponse.builder()

                            .id(f.getId())

                            .fullName(f.getFullName())

                            .email(f.getEmail())

                            .profession(f.getProfession())

                            .profilePicture(f.getProfilePicture())

                            .online(f.getOnline())

                            .build()

            );

        }

        List<Friend> userTwoFriends =
                friendRepository.findByUserTwo(user);

        for (Friend friend : userTwoFriends) {

            User f = friend.getUserOne();

            friends.add(

                    FriendResponse.builder()

                            .id(f.getId())

                            .fullName(f.getFullName())

                            .email(f.getEmail())

                            .profession(f.getProfession())

                            .profilePicture(f.getProfilePicture())

                            .online(f.getOnline())

                            .build()

            );

        }

        return friends;

    }

    @Transactional
    @Override
    public void unfriend(Long friendId, String email) {

        User me = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        User friend = userRepository.findById(friendId)
                .orElseThrow(() ->
                        new RuntimeException("Friend not found"));

        Friend friendship = friendRepository
                .findByUserOneAndUserTwoOrUserOneAndUserTwo(
                        me,
                        friend,
                        friend,
                        me
                )
                .orElseThrow(() ->
                        new RuntimeException("Friendship not found"));

        friendRepository.delete(friendship);

        messagingTemplate.convertAndSend(

        "/topic/friends/" + me.getId(),

        FriendSocketEvent.builder()

                .userId(me.getId())

                .friendId(friend.getId())

                .type("UNFRIENDED")

                .build()

);

messagingTemplate.convertAndSend(

        "/topic/friends/" + friend.getId(),

        FriendSocketEvent.builder()

                .userId(friend.getId())

                .friendId(me.getId())

                .type("UNFRIENDED")

                .build()

);

dashboardRealtimeService.sendDashboardUpdate(

        me.getId()

);

dashboardRealtimeService.sendDashboardUpdate(

        friend.getId()

);

    }

}