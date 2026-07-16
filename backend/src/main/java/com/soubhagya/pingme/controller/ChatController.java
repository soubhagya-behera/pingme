package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.dto.chat.ChatMessage;
import com.soubhagya.pingme.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soubhagya.pingme.dto.request.UpdateMessageStatusRequest;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;


@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/send")
public ResponseEntity<?> sendHttpMessage(

        @RequestBody ChatMessage message,

        Authentication authentication

) {

    chatService.sendMessage(

            message,

            authentication.getName()

    );

    return ResponseEntity.ok().build();

}

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

    

 @PostMapping("/delivered")
public void markDelivered(
        @RequestBody UpdateMessageStatusRequest request){

    chatService.markAsDelivered(request.getMessageId());

}

@PostMapping("/read")
public void markRead(
        @RequestBody UpdateMessageStatusRequest request){

    chatService.markAsRead(request.getMessageId());

}

@PostMapping("/read/{friendId}")
public void markConversationRead(

        @PathVariable Long friendId,

        Authentication authentication

){

    chatService.markConversationAsRead(

            friendId,

            authentication.getName()

    );

}

}