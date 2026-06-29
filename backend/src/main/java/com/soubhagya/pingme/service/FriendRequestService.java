package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.request.FriendRequestDto;
import com.soubhagya.pingme.dto.response.FriendRequestResponse;

import java.util.List;

import java.util.List;
import com.soubhagya.pingme.dto.response.FriendResponse;

public interface FriendRequestService {

    FriendRequestResponse sendRequest(

        FriendRequestDto request,

        String email

);

    List<FriendRequestResponse> getIncomingRequests(Long userId);

    FriendRequestResponse acceptRequest(Long requestId);

    List<FriendResponse> getFriends(String email);
}