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
import com.soubhagya.pingme.dto.request.ActiveConversationRequest;
import com.soubhagya.pingme.payload.ApiResponse;

import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import java.security.Principal;
import com.soubhagya.pingme.dto.chat.TypingEvent;

import org.springframework.web.bind.annotation.PutMapping;

import com.soubhagya.pingme.dto.request.EditMessageRequest;
import com.soubhagya.pingme.dto.request.BulkDeleteRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import com.soubhagya.pingme.dto.request.ForwardMessageRequest;

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

    ChatMessage saved = chatService.sendMessageAndReturn(message, authentication.getName());

    return ResponseEntity.ok(ApiResponse.success("Message sent", saved));

}

    @PostMapping("/sync")
    public ResponseEntity<?> syncMessage(@RequestBody ChatMessage message, Authentication authentication) {
        ChatMessage saved = chatService.syncMessage(message, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Message synced", saved));
    }

    @PostMapping("/sync/batch")
    public ResponseEntity<?> syncBatch(@RequestBody java.util.List<ChatMessage> messages, Authentication authentication) {
        java.util.List<ChatMessage> saved = chatService.syncMessages(messages, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Messages synced", saved));
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

    @MessageMapping("/chat.active")
    public void setActiveConversation(
            ActiveConversationRequest request,
            Principal principal
    ) {

        chatService.setActiveConversation(
                request.getFriendId(),
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

@DeleteMapping("/messages/bulk")
public ResponseEntity<ApiResponse<String>> bulkDelete(
        @RequestBody BulkDeleteRequest request,
        Authentication authentication
) {
    chatService.bulkDelete(
            request.getMessageIds(),
            authentication.getName()
    );
    return ResponseEntity.ok(
            ApiResponse.success(
                    "Messages deleted successfully."
            )
    );
}

@PostMapping("/messages/bulk-delete")
public ResponseEntity<ApiResponse<String>> bulkDeletePost(
        @RequestBody BulkDeleteRequest request,
        Authentication authentication
) {
    chatService.bulkDelete(
            request.getMessageIds(),
            authentication.getName()
    );
    return ResponseEntity.ok(
            ApiResponse.success(
                    "Messages deleted successfully."
            )
    );
}

@PostMapping("/messages/{messageId}/forward")
public ResponseEntity<ApiResponse<String>> forwardMessage(

        @PathVariable Long messageId,

        @RequestBody ForwardMessageRequest request,

        Authentication authentication

) {

    chatService.forwardMessage(

            messageId,

            request.getReceiverId(),

            authentication.getName()

    );

    return ResponseEntity.ok(

            ApiResponse.success(

                    "Message forwarded successfully."

            )

    );

}

@PostMapping("/messages/{messageId}/forward/{receiverId}")
public ResponseEntity<ApiResponse<String>> forwardMessage(

        @PathVariable Long messageId,

        @PathVariable Long receiverId,

        Authentication authentication

) {

    chatService.forwardMessage(
            messageId,
            receiverId,
            authentication.getName()
    );

    return ResponseEntity.ok(
            ApiResponse.success(
                    "Message forwarded successfully."
            )
    );

}

@DeleteMapping("/clear/{friendId}")
public ResponseEntity<ApiResponse<String>> clearChat(

        @PathVariable Long friendId,

        Authentication authentication

) {

    chatService.clearChat(
            friendId,
            authentication.getName()
    );

    return ResponseEntity.ok(
            ApiResponse.success(
                    "Chat cleared successfully."
            )
    );

}

}
