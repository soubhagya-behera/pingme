package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.dto.request.UpdateProfileRequest;
import com.soubhagya.pingme.dto.response.ProfileResponse;
import com.soubhagya.pingme.dto.response.UserSearchResponse;
import com.soubhagya.pingme.payload.ApiResponse;
import com.soubhagya.pingme.service.UserService;
import com.soubhagya.pingme.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserSearchResponse>>> searchUsers(
            @RequestParam String keyword,
            Authentication authentication
    ) {

        return ResponseEntity.ok(

                ResponseUtil.success(

                        "Users Found",

                        userService.searchUsers(

                                keyword,

                                authentication.getName()

                        )

                )

        );

    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(
            Authentication authentication
    ) {

        return ResponseEntity.ok(

                ResponseUtil.success(

                        "Profile Details",

                        userService.getProfile(authentication.getName())

                )

        );

    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {

        return ResponseEntity.ok(

                ResponseUtil.success(

                        "Profile Updated",

                        userService.updateProfile(
                                authentication.getName(),
                                request
                        )

                )

        );

    }

}