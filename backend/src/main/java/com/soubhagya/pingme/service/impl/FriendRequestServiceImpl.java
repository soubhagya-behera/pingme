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

@Service
@RequiredArgsConstructor
public class FriendRequestServiceImpl implements FriendRequestService {

    private final FriendRequestRepository friendRequestRepository;

    private final UserRepository userRepository;

    @Override
public FriendRequestResponse sendRequest(FriendRequestDto request) {

    User sender = userRepository.findById(request.getSenderId())
            .orElseThrow(() ->
                    new RuntimeException("Sender not found"));

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
}