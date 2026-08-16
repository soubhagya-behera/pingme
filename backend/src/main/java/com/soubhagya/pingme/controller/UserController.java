package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.dto.request.PasswordChangeRequest;
import com.soubhagya.pingme.dto.request.UpdateProfileRequest;
import com.soubhagya.pingme.dto.response.ProfileResponse;
import com.soubhagya.pingme.dto.response.UserSearchResponse;
import com.soubhagya.pingme.payload.ApiResponse;
import com.soubhagya.pingme.service.UserService;
import com.soubhagya.pingme.util.ResponseUtil;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @PostMapping(value = "/profile/photo", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfilePhoto(
            @RequestParam("photo") MultipartFile photo,
            Authentication authentication
    ) {

        return ResponseEntity.ok(

                ResponseUtil.success(

                        "Profile photo updated",

                        userService.updateProfilePhoto(
                                authentication.getName(),
                                photo
                        )

                )

        );

    }

    @DeleteMapping("/profile/photo")
    public ResponseEntity<ApiResponse<ProfileResponse>> removeProfilePhoto(
            Authentication authentication
    ) {

        return ResponseEntity.ok(

                ResponseUtil.success(

                        "Profile photo removed",

                        userService.removeProfilePhoto(
                                authentication.getName()
                        )

                )

        );

    }

    @PutMapping("/change-password")
public ResponseEntity<ApiResponse<Void>> changePassword(
        @RequestBody @Valid PasswordChangeRequest request,
        Authentication authentication
) {

    userService.changePassword(
            authentication.getName(),
            request
    );

    return ResponseEntity.ok(

            ResponseUtil.success(

                    "Password changed successfully",

                    null

            )

    );

}

}