package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.dto.chat.ChatMessage;
import com.soubhagya.pingme.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat.send")
    public void sendMessage(ChatMessage message){

        chatService.sendMessage(message);

    }

}