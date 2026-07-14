package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.dto.request.FriendRequestDto;
import com.soubhagya.pingme.dto.response.FriendRequestResponse;
import com.soubhagya.pingme.entity.FriendRequest;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.FriendRequestStatus;
import com.soubhagya.pingme.enums.UserStatus;
import com.soubhagya.pingme.repository.FriendRequestRepository;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.DashboardRealtimeService;
import com.soubhagya.pingme.service.FriendRequestService;
import lombok.RequiredArgsConstructor;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import com.soubhagya.pingme.entity.Friend;
import com.soubhagya.pingme.repository.FriendRepository;
import org.springframework.transaction.annotation.Transactional;

import com.soubhagya.pingme.dto.websocket.FriendRequestSocketEvent;

import com.soubhagya.pingme.dto.response.FriendRequestStatsResponse;


@Service
@RequiredArgsConstructor
public class FriendRequestServiceImpl implements FriendRequestService {

    private final FriendRequestRepository friendRequestRepository;

    private final FriendRepository friendRepository;

    private final UserRepository userRepository;

    private final DashboardRealtimeService dashboardRealtimeService;

    private final SimpMessagingTemplate messagingTemplate;
    

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

boolean alreadyFriends =
        friendRepository
                .existsByUserOneAndUserTwoOrUserOneAndUserTwo(

                        sender,

                        receiver,

                        receiver,

                        sender

                );

if (alreadyFriends) {

    throw new RuntimeException(
            "You are already friends."
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

        messagingTemplate.convertAndSend(

        "/topic/friend-request/" + receiver.getId(),

        FriendRequestSocketEvent.builder()

                .requestId(saved.getId())

                .senderId(sender.getId())

                .senderName(sender.getFullName())

                .senderProfilePicture(sender.getProfilePicture())

                .type("NEW_REQUEST")

                .build()

);


        dashboardRealtimeService.sendDashboardUpdate(

        receiver.getId()

);

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

        .senderEmail(request.getSender().getEmail())

        .senderProfession(request.getSender().getProfession())

        .senderProfilePicture(request.getSender().getProfilePicture())

        .senderOnline(request.getSender().getOnline())

        .receiverName(request.getReceiver().getFullName())

        .status(request.getStatus().name())

        .createdAt(request.getCreatedAt())

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

    // Request must still be pending
    if (request.getStatus() != FriendRequestStatus.PENDING) {

        throw new RuntimeException(
                "Request already processed");

    }

    // Check if users are already friends
    boolean alreadyFriends =
            friendRepository
                    .existsByUserOneAndUserTwoOrUserOneAndUserTwo(

                            request.getSender(),
                            request.getReceiver(),

                            request.getReceiver(),
                            request.getSender()

                    );

    if (alreadyFriends) {

        throw new RuntimeException(
                "Users are already friends."
        );

    }

    // Accept request
    friendRequestRepository.delete(request);


    // Create friendship
    Friend friend = Friend.builder()

            .userOne(request.getSender())

            .userTwo(request.getReceiver())

            .friendsSince(LocalDateTime.now())

            .build();

    friendRepository.save(friend);

    messagingTemplate.convertAndSend(

        "/topic/friend-request/" + request.getSender().getId(),

        FriendRequestSocketEvent.builder()

                .requestId(request.getId())

                .senderId(request.getReceiver().getId())

                .senderName(request.getReceiver().getFullName())

                .senderProfilePicture(request.getReceiver().getProfilePicture())

                .type("ACCEPTED")

                .build()

);

    dashboardRealtimeService.sendDashboardUpdate(

        request.getSender().getId()

);

dashboardRealtimeService.sendDashboardUpdate(

        request.getReceiver().getId()

);

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

@Transactional
@Override
public FriendRequestResponse rejectRequest(
        Long requestId,
        String email) {

    User loggedInUser =
            userRepository.findByEmail(email)
                    .orElseThrow(() ->
                            new RuntimeException("User not found"));

    FriendRequest request =
            friendRequestRepository.findById(requestId)
                    .orElseThrow(() ->
                            new RuntimeException("Request not found"));

    if(!request.getReceiver().getId().equals(loggedInUser.getId())){

        throw new RuntimeException(
                "You are not allowed to reject this request"
        );

    }

    if(request.getStatus()!=FriendRequestStatus.PENDING){

        throw new RuntimeException(
                "Request already processed"
        );

    }

    

    friendRequestRepository.delete(request);

    dashboardRealtimeService.sendDashboardUpdate(
        request.getSender().getId()
);

dashboardRealtimeService.sendDashboardUpdate(
        request.getReceiver().getId()
);

    messagingTemplate.convertAndSend(

        "/topic/friend-request/" + request.getSender().getId(),

        FriendRequestSocketEvent.builder()

                .requestId(request.getId())

                .senderId(request.getReceiver().getId())

                .senderName(request.getReceiver().getFullName())

                .senderProfilePicture(request.getReceiver().getProfilePicture())

                .type("REJECTED")

                .build()

);

    return FriendRequestResponse.builder()

            .requestId(request.getId())

            .senderId(request.getSender().getId())

            .receiverId(request.getReceiver().getId())

            .senderName(request.getSender().getFullName())

            .receiverName(request.getReceiver().getFullName())

            .status(request.getStatus().name())

            .build();

}

@Transactional
@Override
public FriendRequestResponse cancelRequest(

        Long requestId,

        String email

){

    User loggedInUser =

            userRepository.findByEmail(email)

                    .orElseThrow(() ->

                            new RuntimeException(

                                    "User not found"

                            )

                    );

    FriendRequest request =

            friendRequestRepository.findById(requestId)

                    .orElseThrow(() ->

                            new RuntimeException(

                                    "Friend request not found"

                            )

                    );

    if(

            !request.getSender().getId()

                    .equals(loggedInUser.getId())

    ){

        throw new RuntimeException(

                "You cannot cancel this request"

        );

    }

    if(

            request.getStatus()

            !=

            FriendRequestStatus.PENDING

    ){

        throw new RuntimeException(

                "Request already processed"

        );

    }

    friendRequestRepository.delete(request);

    messagingTemplate.convertAndSend(

        "/topic/friend-request/" + request.getReceiver().getId(),

        FriendRequestSocketEvent.builder()

                .requestId(request.getId())

                .senderId(request.getSender().getId())

                .senderName(request.getSender().getFullName())

                .senderProfilePicture(request.getSender().getProfilePicture())

                .type("CANCELLED")

                .build()

);

dashboardRealtimeService.sendDashboardUpdate(
        request.getSender().getId()
);

    dashboardRealtimeService.sendDashboardUpdate(

            request.getReceiver().getId()

    );

    return FriendRequestResponse.builder()

            .requestId(requestId)

            .senderId(request.getSender().getId())

            .receiverId(request.getReceiver().getId())

            .senderName(request.getSender().getFullName())

            .receiverName(request.getReceiver().getFullName())

            .status("CANCELLED")

            .build();

}

@Override
public FriendRequestStatsResponse getStats(

        String email

) {

    User user =

            userRepository.findByEmail(email)

                    .orElseThrow(() ->

                            new RuntimeException(

                                    "User not found"

                            )

                    );

    long pending =

            friendRequestRepository.countByReceiver(

                    user

            );

    long today =

            friendRequestRepository

                    .countByReceiverAndCreatedAtAfter(

                            user,

                            LocalDateTime.now()

                                    .toLocalDate()

                                    .atStartOfDay()

                    );

    long sent =

            friendRequestRepository.countBySender(

                    user

            );

    return FriendRequestStatsResponse.builder()

            .pending(pending)

            .today(today)

            .sent(sent)

            .build();

}
}