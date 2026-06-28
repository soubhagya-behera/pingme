package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.request.FriendRequestDto;
import com.soubhagya.pingme.dto.response.FriendRequestResponse;

public interface FriendRequestService {

    FriendRequestResponse sendRequest(FriendRequestDto request);

}