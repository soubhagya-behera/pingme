package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.dto.response.UserResponse;
import com.soubhagya.pingme.payload.ApiResponse;
import com.soubhagya.pingme.service.AdminService;
import com.soubhagya.pingme.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/pending-users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getPendingUsers() {

        return ResponseEntity.ok(
                ResponseUtil.success(
                        "Pending Users",
                        adminService.getPendingUsers()
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

}