package com.soubhagya.pingme.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSettingsResponse {

    // Admin Profile
    private String adminName;
    private String adminEmail;
    private String role;

    // Security
    private boolean jwtEnabled;
    private boolean adminApprovalEnabled;
    private boolean emailVerificationEnabled;
    private boolean httpsEnabled;

    // System
    private String applicationName;
    private String applicationVersion;
    private String javaVersion;
    private String springBootVersion;
    private String database;
    private String serverTime;

    // Database Statistics
    private long totalUsers;
    private long totalFriends;
    private long totalMessages;
    private long totalFriendRequests;

    // About
    private String developer;
    private String framework;
    private String license;

}