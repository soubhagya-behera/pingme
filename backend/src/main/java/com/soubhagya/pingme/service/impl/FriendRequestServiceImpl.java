package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.dto.request.FriendRequestDto;
import com.soubhagya.pingme.dto.response.FriendRequestResponse;
import com.soubhagya.pingme.entity.FriendRequest;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.FriendRequestStatus;
import com.soubhagya.pingme.enums.UserStatus;
import com.soubhagya.pingme.repository.FriendRequestRepository;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.FriendRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import com.soubhagya.pingme.entity.Friend;
import com.soubhagya.pingme.repository.FriendRepository;
import org.springframework.transaction.annotation.Transactional;

import com.soubhagya.pingme.dto.response.FriendResponse;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FriendRequestServiceImpl implements FriendRequestService {

    private final FriendRequestRepository friendRequestRepository;

    private final FriendRepository friendRepository;

    private final UserRepository userRepository;

    

    @Override
public FriendRequestResponse sendRequest(

        FriendRequestDto request,

        String email) {

User sender =
        userRepository.findByEmail(email)

                .orElseThrow(() ->

                        new RuntimeException(

                                "Sender not found"

                        ));

    User receiver = userRepository.findById(request.getReceiverId())
            .orElseThrow(() ->
                    new RuntimeException("Receiver not found"));

                    if(sender.getId().equals(receiver.getId())){

    throw new RuntimeException(
            "You cannot send request to yourself");

}

if(sender.getStatus()!= UserStatus.APPROVED){

    throw new RuntimeException(
            "Sender account is not approved");

}

if(receiver.getStatus()!=UserStatus.APPROVED){

    throw new RuntimeException(
            "Receiver account is not approved");

}

boolean pendingExists =
        friendRequestRepository
                .existsBySenderAndReceiverAndStatus(

                        sender,

                        receiver,

                        FriendRequestStatus.PENDING

                );

if(pendingExists){

    throw new RuntimeException(
            "Friend request already sent");

}

boolean reversePending =
        friendRequestRepository
                .existsBySenderAndReceiverAndStatus(

                        receiver,

                        sender,

                        FriendRequestStatus.PENDING

                );

if(reversePending){

    throw new RuntimeException(

            "This user has already sent you a request"

    );

}

FriendRequest friendRequest =
        FriendRequest.builder()

                .sender(sender)

                .receiver(receiver)

                .status(FriendRequestStatus.PENDING)

                .createdAt(LocalDateTime.now())

                .build();

FriendRequest saved =
        friendRequestRepository.save(friendRequest);

        return FriendRequestResponse.builder()

        .requestId(saved.getId())

        .senderId(sender.getId())

        .receiverId(receiver.getId())

        .senderName(sender.getFullName())

        .receiverName(receiver.getFullName())

        .status(saved.getStatus().name())

        .build();

}

@Override
public List<FriendRequestResponse> getIncomingRequests(String email) {

    User receiver = userRepository.findByEmail(email)
        .orElseThrow(() ->
                new RuntimeException("User not found"));

    List<FriendRequest> requests =
            friendRequestRepository.findByReceiverAndStatus(

                    receiver,

                    FriendRequestStatus.PENDING

            );

    return requests.stream()

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

@Transactional
@Override
public FriendRequestResponse acceptRequest(
        Long requestId,
        String email) {

    // Logged-in user from JWT
    User loggedInUser = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    // Friend request
    FriendRequest request = friendRequestRepository.findById(requestId)
            .orElseThrow(() ->
                    new RuntimeException("Request not found"));

    // Only receiver can accept
    if (!request.getReceiver().getId().equals(loggedInUser.getId())) {

        throw new RuntimeException(
                "You are not allowed to accept this request");

    }

    // Already processed?
    if (request.getStatus() != FriendRequestStatus.PENDING) {

        throw new RuntimeException(
                "Request already processed");

    }

    // Accept request
    request.setStatus(FriendRequestStatus.ACCEPTED);

    friendRequestRepository.save(request);

    // Create friendship
    Friend friend = Friend.builder()
            .userOne(request.getSender())
            .userTwo(request.getReceiver())
            .friendsSince(LocalDateTime.now())
            .build();

    friendRepository.save(friend);

    // Response
    return FriendRequestResponse.builder()
            .requestId(request.getId())
            .senderId(request.getSender().getId())
            .receiverId(request.getReceiver().getId())
            .senderName(request.getSender().getFullName())
            .receiverName(request.getReceiver().getFullName())
            .status(request.getStatus().name())
            .build();
}

@Override
public List<FriendResponse> getFriends(String email) {

    User user = userRepository.findByEmail(email)

        .orElseThrow(() ->

                new RuntimeException("User not found"));
            

    List<FriendResponse> friends = new ArrayList<>();

    List<Friend> userOneFriends =
            friendRepository.findByUserOne(user);

    for(Friend friend : userOneFriends){

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

    for(Friend friend : userTwoFriends){

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
}