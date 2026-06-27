package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.response.UserResponse;

import java.util.List;

public interface AdminService {

    List<UserResponse> getPendingUsers();

    UserResponse approveUser(Long id);

    UserResponse rejectUser(Long id);
}