package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.dto.response.MessageResponse;
import com.soubhagya.pingme.payload.ApiResponse;
import com.soubhagya.pingme.service.MessageService;
import com.soubhagya.pingme.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/history/{friendId}")
public ResponseEntity<ApiResponse<List<MessageResponse>>> getChatHistory(

        @PathVariable Long friendId,

        Authentication authentication){

    return ResponseEntity.ok(

            ResponseUtil.success(

                    "Chat History",

                    messageService.getChatHistory(

                            authentication.getName(),

                            friendId

                    )

            )

    );

}

}