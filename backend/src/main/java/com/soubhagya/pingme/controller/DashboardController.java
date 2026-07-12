package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.dto.response.DashboardResponse;
import com.soubhagya.pingme.payload.ApiResponse;
import com.soubhagya.pingme.service.DashboardService;
import com.soubhagya.pingme.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ApiResponse<DashboardResponse> getDashboard(
            Authentication authentication
    ) {

        DashboardResponse response =
                dashboardService.getDashboard(
                        authentication.getName()
                );

        return ResponseUtil.success(
        "Dashboard Loaded Successfully",
        response
);

    }

}