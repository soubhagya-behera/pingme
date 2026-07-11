package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.dto.request.LoginRequest;
import com.soubhagya.pingme.dto.request.RegisterRequest;
import com.soubhagya.pingme.dto.response.LoginResponse;
import com.soubhagya.pingme.dto.response.UserResponse;
import com.soubhagya.pingme.payload.ApiResponse;
import com.soubhagya.pingme.service.AuthService;
import com.soubhagya.pingme.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.soubhagya.pingme.dto.request.SetPasswordRequest;
import com.soubhagya.pingme.dto.request.ForgotPasswordRequest;
import com.soubhagya.pingme.dto.request.ResetPasswordRequest;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(

            @Valid @RequestBody RegisterRequest request){

        UserResponse response = authService.register(request);

        return ResponseEntity.ok(

                ResponseUtil.success(

                        "User Registered Successfully",

                        response

                )

        );

    }

    @PostMapping("/login")
public ResponseEntity<ApiResponse<LoginResponse>> login(
        @Valid @RequestBody LoginRequest request) {

    LoginResponse response = authService.login(request);

    return ResponseEntity.ok(
            ResponseUtil.success(
                    "Login Successful",
                    response
            )
    );

}

@GetMapping("/activate")
public ResponseEntity<ApiResponse<Boolean>> validateActivationToken(

        @RequestParam String token){

    return ResponseEntity.ok(

            ResponseUtil.success(

                    "Token Valid",

                    authService.validateActivationToken(token)

            )

    );

}

@PostMapping("/set-password")
public ResponseEntity<ApiResponse<String>> setPassword(

        @Valid

        @RequestBody

        SetPasswordRequest request){

    authService.setPassword(request);

    return ResponseEntity.ok(

            ResponseUtil.success(

                    "Password Created Successfully",

                    "Account Activated"

            )

    );

}

@PostMapping("/forgot-password")
public ResponseEntity<ApiResponse<String>> forgotPassword(

        @Valid
        @RequestBody
        ForgotPasswordRequest request
) {

    authService.forgotPassword(request.getEmail());

    return ResponseEntity.ok(

            ResponseUtil.success(

                    "Password reset OTP sent successfully.",

                    "OTP Sent"

            )

    );

}

@PostMapping("/reset-password")
public ResponseEntity<ApiResponse<String>> resetPassword(

        @Valid
        @RequestBody
        ResetPasswordRequest request
) {

    authService.resetPassword(

            request.getEmail(),

            request.getOtp(),

            request.getNewPassword()

    );

    return ResponseEntity.ok(

            ResponseUtil.success(

                    "Password reset successful.",

                    "Password Updated"

            )

    );

}

}