package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.dto.request.FriendRequestDto;
import com.soubhagya.pingme.dto.response.FriendRequestResponse;
import com.soubhagya.pingme.payload.ApiResponse;
import com.soubhagya.pingme.service.FriendRequestService;
import com.soubhagya.pingme.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/friend-request")
@RequiredArgsConstructor
public class FriendRequestController {

    private final FriendRequestService friendRequestService;

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<FriendRequestResponse>>
    sendRequest(

            @Valid
            @RequestBody
            FriendRequestDto request){

        return ResponseEntity.ok(

                ResponseUtil.success(

                        "Friend Request Sent",

                        friendRequestService.sendRequest(request)

                )

        );

    }

}