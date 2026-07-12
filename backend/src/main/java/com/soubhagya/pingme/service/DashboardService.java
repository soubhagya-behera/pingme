package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.response.DashboardResponse;

public interface DashboardService {

    DashboardResponse getDashboard(String email);

}