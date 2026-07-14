package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.request.FriendRequestDto;
import com.soubhagya.pingme.dto.response.FriendRequestResponse;
import com.soubhagya.pingme.dto.response.FriendRequestStatsResponse;

import java.util.List;

import java.util.List;
import com.soubhagya.pingme.dto.response.FriendResponse;


public interface FriendRequestService {

    FriendRequestResponse sendRequest(FriendRequestDto request, String email);

List<FriendRequestResponse> getIncomingRequests(String email);

FriendRequestResponse acceptRequest(Long requestId, String email);

FriendRequestResponse rejectRequest(Long requestId, String email);

FriendRequestResponse cancelRequest(

        Long requestId,

        String email

);

FriendRequestStatsResponse getStats(String email);
}