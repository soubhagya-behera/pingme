package com.soubhagya.pingme.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponse {

    private Long id;

    private String fullName;

    private String email;

    private String profession;

    private String bio;

    private String phone;

    private String profilePicture;

    // NEW

    private String role;

    private Boolean emailVerified;

    private LocalDateTime createdAt;

    private LocalDateTime lastSeen;

}