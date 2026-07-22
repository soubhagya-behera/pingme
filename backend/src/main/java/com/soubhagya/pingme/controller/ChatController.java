package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.dto.chat.ChatMessage;
import com.soubhagya.pingme.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soubhagya.pingme.dto.request.EditMessageRequest;
import com.soubhagya.pingme.dto.request.UpdateMessageStatusRequest;
import com.soubhagya.pingme.payload.ApiResponse;

import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import java.security.Principal;
import com.soubhagya.pingme.dto.chat.TypingEvent;

import org.springframework.web.bind.annotation.PutMapping;

import com.soubhagya.pingme.dto.request.EditMessageRequest;
import org.springframework.web.bind.annotation.DeleteMapping;

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
            Principal principal) {
        chatService.sendMessage(message, principal.getName());

    }

    

    @MessageMapping("/chat.delivered")
    public void markDelivered(UpdateMessageStatusRequest request, Principal principal) {
        chatService.markAsDelivered(request.getMessageId(), principal.getName());
    }

    @MessageMapping("/chat.read")
    public void markRead(UpdateMessageStatusRequest request, Principal principal) {
        chatService.markAsRead(request.getMessageId(), principal.getName());
    }

    @MessageMapping("/chat.ready")
    public void ready(Principal principal) {
        chatService.replayUndeliveredMessages(principal.getName());
    }

    @MessageMapping("/chat.typing")
public void typing(

        TypingEvent event,

        Principal principal

){

    chatService.sendTypingEvent(

            event,

            principal.getName()

    );

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

@PutMapping("/messages/{messageId}")
public ResponseEntity<?> editMessage(

        @PathVariable Long messageId,

        @RequestBody EditMessageRequest request,

        Authentication authentication

){

    chatService.editMessage(

            messageId,

            request.getContent(),

            authentication.getName()

    );

    return ResponseEntity.ok().build();

}

@DeleteMapping("/messages/{messageId}")
public ResponseEntity<ApiResponse<String>> deleteForEveryone(

        @PathVariable Long messageId,

        Authentication authentication

) {

    chatService.deleteForEveryone(

            messageId,

            authentication.getName()

    );

    return ResponseEntity.ok(

            ApiResponse.success(

                    "Message deleted successfully."

            )

    );

}

@DeleteMapping("/messages/{messageId}/me")
public ResponseEntity<ApiResponse<Void>> deleteForMe(
        @PathVariable Long messageId,
        Authentication authentication
) {

    chatService.deleteForMe(
            messageId,
            authentication.getName()
    );

    return ResponseEntity.ok(
            ApiResponse.success(
                    "Deleted"
            )
    );

}

}
