package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.websocket.TypingMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class TypingController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.typing")
    public void typing(TypingMessage message){

        messagingTemplate.convertAndSend(
                "/topic/typing/" + message.getReceiverId(),
                message
        );

    }
}