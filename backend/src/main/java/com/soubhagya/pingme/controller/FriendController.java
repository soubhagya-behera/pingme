package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.dto.response.FriendResponse;
import com.soubhagya.pingme.payload.ApiResponse;
import com.soubhagya.pingme.service.FriendService;
import com.soubhagya.pingme.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FriendResponse>>> getFriends(
            Authentication authentication
    ) {

        return ResponseEntity.ok(

                ResponseUtil.success(

                        "Friends List",

                        friendService.getFriends(

                                authentication.getName()

                        )

                )

        );

    }

    @DeleteMapping("/{friendId}")
public ResponseEntity<ApiResponse<Void>> unfriend(

        @PathVariable Long friendId,

        Authentication authentication

) {

    friendService.unfriend(

            friendId,

            authentication.getName()

    );

    return ResponseEntity.ok(

            ResponseUtil.success(

                    "Friend Removed",

                    null

            )

    );

}

}