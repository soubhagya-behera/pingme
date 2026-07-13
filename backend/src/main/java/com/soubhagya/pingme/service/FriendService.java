package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.response.FriendResponse;

import java.util.List;

public interface FriendService {

    List<FriendResponse> getFriends(String email);

    void unfriend(Long friendId, String email);

}