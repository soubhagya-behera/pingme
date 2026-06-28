package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.dto.chat.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    @MessageMapping("/chat.send")
    public void sendMessage(ChatMessage message){

        System.out.println("Message Received : "
                + message.getContent());

    }

}