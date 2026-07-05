package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.response.AdminDashboardStatsResponse;
import com.soubhagya.pingme.dto.response.AdminUserPageResponse;
import com.soubhagya.pingme.dto.response.UserResponse;

import java.util.List;

public interface AdminService {

    AdminDashboardStatsResponse getDashboardStats();

    AdminUserPageResponse getUsers(String status, String search, int page, int size);

    List<UserResponse> getPendingUsers();

    UserResponse getUserById(Long id);

    UserResponse approveUser(Long id);

    UserResponse rejectUser(Long id);

    void deleteUser(Long id);
}
