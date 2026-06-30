package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.dto.request.FriendRequestDto;
import com.soubhagya.pingme.dto.response.FriendRequestResponse;
import com.soubhagya.pingme.dto.response.FriendResponse;
import com.soubhagya.pingme.payload.ApiResponse;
import com.soubhagya.pingme.service.FriendRequestService;
import com.soubhagya.pingme.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.soubhagya.pingme.dto.response.FriendResponse;
import java.util.List;

import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/friend-request")
@RequiredArgsConstructor
public class FriendRequestController {

    private final FriendRequestService friendRequestService;

    @PostMapping("/send")
public ResponseEntity<ApiResponse<FriendRequestResponse>> sendRequest(

        @RequestBody FriendRequestDto request,

        Authentication authentication){

    FriendRequestResponse response =

            friendRequestService.sendRequest(

                    request,

                    authentication.getName()

            );

    return ResponseEntity.ok(

            ResponseUtil.success(

                    "Friend Request Sent",

                    response

            )

    );

}

    @GetMapping("/incoming")
public ResponseEntity<ApiResponse<List<FriendRequestResponse>>> getIncomingRequests(
        Authentication authentication) {

    return ResponseEntity.ok(

            ResponseUtil.success(

                    "Incoming Friend Requests",

                    friendRequestService.getIncomingRequests(
                            authentication.getName()
                    )

            )

    );

}

@PutMapping("/accept/{requestId}")
public ResponseEntity<ApiResponse<FriendRequestResponse>>
acceptRequest(

        @PathVariable Long requestId,

        Authentication authentication){

    return ResponseEntity.ok(

            ResponseUtil.success(

                    "Friend Request Accepted",

                    friendRequestService.acceptRequest(

                            requestId,

                            authentication.getName()

                    )

            )

    );

}

@GetMapping("/friends")
public ResponseEntity<ApiResponse<List<FriendResponse>>>
getFriends(Authentication authentication){

    return ResponseEntity.ok(

            ResponseUtil.success(

                    "Friends List",

                    friendRequestService.getFriends(

        authentication.getName()

)

            )

    );

}

}