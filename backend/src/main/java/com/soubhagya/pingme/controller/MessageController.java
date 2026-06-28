package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.dto.response.MessageResponse;
import com.soubhagya.pingme.payload.ApiResponse;
import com.soubhagya.pingme.service.MessageService;
import com.soubhagya.pingme.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/{senderId}/{receiverId}")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getChatHistory(

            @PathVariable Long senderId,

            @PathVariable Long receiverId){

        return ResponseEntity.ok(

                ResponseUtil.success(

                        "Chat History",

                        messageService.getChatHistory(

                                senderId,

                                receiverId

                        )

                )

        );

    }

}