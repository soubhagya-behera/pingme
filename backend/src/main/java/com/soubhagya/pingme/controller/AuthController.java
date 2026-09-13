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
import com.soubhagya.pingme.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final com.soubhagya.pingme.service.LogoutService logoutService;
    private final RateLimitService rateLimitService;

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
        @Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {

    // H8: per-IP + per-email rate limit to prevent brute force, configurable via app.rate-limit.login
    String loginKey = (httpRequest.getRemoteAddr() != null ? httpRequest.getRemoteAddr() : "unknown") + ":" + request.getEmail().toLowerCase();
    rateLimitService.checkLogin(loginKey);
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
        ForgotPasswordRequest request,
        HttpServletRequest httpRequest
) {

    String fpKey = (httpRequest.getRemoteAddr() != null ? httpRequest.getRemoteAddr() : "unknown") + ":" + request.getEmail().toLowerCase();
    rateLimitService.checkForgotPassword(fpKey);
    authService.forgotPassword(request.getEmail());

    // Generic response in both cases so callers cannot probe for registered emails.
    return ResponseEntity.ok(

            ResponseUtil.success(

                    "If the account exists, an OTP has been sent.",

                    "OTP Sent"

            )

    );

}

@PostMapping("/reset-password")
public ResponseEntity<ApiResponse<String>> resetPassword(

        @Valid
        @RequestBody
        ResetPasswordRequest request,
        HttpServletRequest httpRequest
) {

    String rpKey = (httpRequest.getRemoteAddr() != null ? httpRequest.getRemoteAddr() : "unknown") + ":" + request.getEmail().toLowerCase();
    rateLimitService.checkResetPassword(rpKey);
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

@PostMapping("/logout")
public ResponseEntity<ApiResponse<String>> logout(
        org.springframework.security.core.Authentication authentication,
        jakarta.servlet.http.HttpServletRequest request
) {
    // Server-side revocation: bump the token version so the current JWT stops working.
    // The frontend still clears local storage (existing behavior).
    logoutService.logout(authentication, request);

    return ResponseEntity.ok(

            ResponseUtil.success(

                    "Logged out successfully.",

                    "Logged Out"

            )

    );

}

}