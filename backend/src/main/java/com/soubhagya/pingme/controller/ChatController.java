package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.dto.chat.ChatMessage;
import com.soubhagya.pingme.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat.send")
    public void sendMessage(
            ChatMessage message,
            SimpMessageHeaderAccessor headerAccessor) {

        String email =
                (String) headerAccessor
                        .getSessionAttributes()
                        .get("email");

        chatService.sendMessage(message, email);

    }

}