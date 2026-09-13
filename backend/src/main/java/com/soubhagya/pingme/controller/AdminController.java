package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.dto.response.AdminDashboardStatsResponse;
import com.soubhagya.pingme.dto.response.AdminSettingsResponse;
import com.soubhagya.pingme.dto.response.AdminUserPageResponse;
import com.soubhagya.pingme.dto.response.UserResponse;
import com.soubhagya.pingme.payload.ApiResponse;
import com.soubhagya.pingme.service.AdminService;
import com.soubhagya.pingme.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.soubhagya.pingme.dto.response.AdminSettingsResponse;

import com.soubhagya.pingme.dto.request.ChangePasswordRequest;
import com.soubhagya.pingme.dto.request.SendPasswordOtpRequest;
import com.soubhagya.pingme.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@org.springframework.validation.annotation.Validated
public class AdminController {

    private final AdminService adminService;
    private final RateLimitService rateLimitService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardStatsResponse>> getDashboardStats() {

        return ResponseEntity.ok(
                ResponseUtil.success(
                        "Admin Dashboard Statistics",
                        adminService.getDashboardStats()
                )
        );
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<AdminUserPageResponse>> getUsers(
            @RequestParam(required = false) @jakarta.validation.constraints.Size(max = 20, message = "status filter too long") String status,
            @RequestParam(required = false) @jakarta.validation.constraints.Size(max = 100, message = "search must be at most 100 characters") String search,
            @RequestParam(defaultValue = "0") @jakarta.validation.constraints.Min(value = 0, message = "page must be >= 0") int page,
            @RequestParam(defaultValue = "10") @jakarta.validation.constraints.Min(value = 1, message = "size must be >= 1") @jakarta.validation.constraints.Max(value = 50, message = "size must be <= 50") int size) {

        return ResponseEntity.ok(
                ResponseUtil.success(
                        "Users Fetched Successfully",
                        adminService.getUsers(status, search, page, size)
                )
        );
    }

    @GetMapping("/pending-users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getPendingUsers() {

        return ResponseEntity.ok(
                ResponseUtil.success(
                        "Pending Users",
                        adminService.getPendingUsers()
                )
        );
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable @jakarta.validation.constraints.Positive Long id) {

        return ResponseEntity.ok(
                ResponseUtil.success(
                        "User Fetched Successfully",
                        adminService.getUserById(id)
                )
        );
    }

    @PutMapping("/approve/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> approveUser(
            @PathVariable @jakarta.validation.constraints.Positive Long id) {

        return ResponseEntity.ok(

                ResponseUtil.success(

                        "User Approved Successfully",

                        adminService.approveUser(id)

                )

        );

    }

    @PutMapping("/reject/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> rejectUser(
            @PathVariable @jakarta.validation.constraints.Positive Long id) {

        return ResponseEntity.ok(

                ResponseUtil.success(

                        "User Rejected Successfully",

                        adminService.rejectUser(id)

                )

        );

    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable @jakarta.validation.constraints.Positive Long id) {

        adminService.deleteUser(id);

        return ResponseEntity.ok(
                ResponseUtil.success(
                        "User Deleted Successfully",
                        null
                )
        );

    }

    @PutMapping("/resend-activation/{id}")
public ResponseEntity<?> resendActivationEmail(
        @PathVariable @jakarta.validation.constraints.Positive Long id
) {

    return ResponseEntity.ok(

            ResponseUtil.success(

                    "Activation email sent successfully",

                    adminService.resendActivationEmail(id)

            )

    );

}

@GetMapping("/settings")
public ResponseEntity<ApiResponse<AdminSettingsResponse>> getSettings() {

    return ResponseEntity.ok(

            ResponseUtil.success(

                    "Settings Loaded",

                    adminService.getSettings()

            )

    );

}

@PostMapping("/send-password-otp")
public ResponseEntity<?> sendPasswordOtp(

        @Valid
        @RequestBody
        SendPasswordOtpRequest request,
        HttpServletRequest httpRequest

) {

    String key = (httpRequest.getRemoteAddr() != null ? httpRequest.getRemoteAddr() : "unknown") + ":" + request.getEmail().toLowerCase();
    rateLimitService.checkOtp(key);
    adminService.sendPasswordOtp(
            request.getEmail()
    );

    return ResponseEntity.ok(

            ResponseUtil.success(

                    "OTP sent successfully",

                    null

            )

    );

}

@PostMapping("/change-password")
public ResponseEntity<?> changePassword(

        @Valid
        @RequestBody
        ChangePasswordRequest request,
        HttpServletRequest httpRequest

) {

    String key = (httpRequest.getRemoteAddr() != null ? httpRequest.getRemoteAddr() : "unknown") + ":" + request.getEmail().toLowerCase();
    rateLimitService.checkResetPassword(key);
    adminService.changePassword(

            request.getEmail(),

            request.getOtp(),

            request.getNewPassword()

    );

    return ResponseEntity.ok(

            ResponseUtil.success(

                    "Password changed successfully",

                    null

            )

    );

}

}
