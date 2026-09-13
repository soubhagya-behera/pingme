package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.dto.response.ChatSidebarResponse;
import com.soubhagya.pingme.dto.response.MessageResponse;
import com.soubhagya.pingme.dto.response.RecentChatResponse;
import com.soubhagya.pingme.payload.ApiResponse;
import com.soubhagya.pingme.service.MessageService;
import com.soubhagya.pingme.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@org.springframework.validation.annotation.Validated
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/history/{friendId}")
    public ResponseEntity<ApiResponse<Page<MessageResponse>>> getChatHistory(

            @PathVariable @jakarta.validation.constraints.Positive Long friendId,

            @RequestParam(defaultValue = "0") @jakarta.validation.constraints.Min(value = 0, message = "Page must be >= 0") int page,

            @RequestParam(defaultValue = "20") @jakarta.validation.constraints.Min(value = 1, message = "Size must be >= 1") @jakarta.validation.constraints.Max(value = 50, message = "Size must be <= 50") int size,

            Authentication authentication
    ) {

        return ResponseEntity.ok(

                ResponseUtil.success(

                        "Chat History",

                        messageService.getChatHistory(

                                authentication.getName(),

                                friendId,

                                page,

                                size

                        )

                )

        );

    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<RecentChatResponse>>> recentChats(
            Authentication authentication){

        return ResponseEntity.ok(

                ResponseUtil.success(

                        "Recent Chats",

                        messageService.getRecentChats(
                                authentication.getName()
                        )

                )

        );

    }

    @GetMapping("/search/{friendId}")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> searchMessages(

            @PathVariable @jakarta.validation.constraints.Positive Long friendId,

            @RequestParam @jakarta.validation.constraints.Size(max = 200, message = "Search query must be at most 200 characters") String query,

            @RequestParam(defaultValue = "100") @jakarta.validation.constraints.Min(value = 1, message = "Limit must be >= 1") @jakarta.validation.constraints.Max(value = 100, message = "Limit must be <= 100") int limit,

            Authentication authentication
    ) {

        return ResponseEntity.ok(

                ResponseUtil.success(

                        "Message Search Results",

                        messageService.searchChatMessages(

                                authentication.getName(),

                                friendId,

                                query,

                                limit

                        )

                )

        );

    }

    @GetMapping("/chat-sidebar")
    public ResponseEntity<ApiResponse<List<ChatSidebarResponse>>> getChatSidebar(

            Authentication authentication

    ) {

        return ResponseEntity.ok(

                ResponseUtil.success(

                        "Chat Sidebar",

                        messageService.getChatSidebar(

                                authentication.getName()

                        )

                )

        );

    }

}