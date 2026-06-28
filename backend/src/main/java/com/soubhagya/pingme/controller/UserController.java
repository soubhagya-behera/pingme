package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.dto.response.UserSearchResponse;
import com.soubhagya.pingme.payload.ApiResponse;
import com.soubhagya.pingme.service.UserService;
import com.soubhagya.pingme.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<UserSearchResponse>> searchUser(
            @RequestParam String email){

        return ResponseEntity.ok(

                ResponseUtil.success(

                        "User Found",

                        userService.searchUser(email)

                )

        );

    }

}