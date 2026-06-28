package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.request.FriendRequestDto;
import com.soubhagya.pingme.dto.response.FriendRequestResponse;

import java.util.List;

public interface FriendRequestService {

    FriendRequestResponse sendRequest(FriendRequestDto request);

    List<FriendRequestResponse> getIncomingRequests(Long userId);

    FriendRequestResponse acceptRequest(Long requestId);
}