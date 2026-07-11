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
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

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
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

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
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {

        return ResponseEntity.ok(
                ResponseUtil.success(
                        "User Fetched Successfully",
                        adminService.getUserById(id)
                )
        );
    }

    @PutMapping("/approve/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> approveUser(
            @PathVariable Long id) {

        return ResponseEntity.ok(

                ResponseUtil.success(

                        "User Approved Successfully",

                        adminService.approveUser(id)

                )

        );

    }

    @PutMapping("/reject/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> rejectUser(
            @PathVariable Long id) {

        return ResponseEntity.ok(

                ResponseUtil.success(

                        "User Rejected Successfully",

                        adminService.rejectUser(id)

                )

        );

    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {

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
        @PathVariable Long id
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
        SendPasswordOtpRequest request

) {

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
        ChangePasswordRequest request

) {

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
