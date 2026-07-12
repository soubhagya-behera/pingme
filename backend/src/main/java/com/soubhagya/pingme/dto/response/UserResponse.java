package com.soubhagya.pingme.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;

    private String fullName;

    private String email;

    private String profession;

    private String bio;

    private String phone;

    private String role;

    private String status;

    private Boolean online;

    private Boolean emailVerified;

    private Boolean mustChangePassword;

    private String profilePicture;

    private String createdAt;

    private String updatedAt;

    private String lastSeen;

    private Long requestId;

}
