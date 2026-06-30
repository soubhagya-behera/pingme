package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.response.MessageResponse;

import java.util.List;

public interface MessageService {

    List<MessageResponse> getChatHistory(

        String email,

        Long friendId

    );

}