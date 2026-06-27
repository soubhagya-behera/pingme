package com.soubhagya.pingme.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {

    private Long id;

    private String fullName;

    private String email;

    private String profession;

    private String bio;

    private String phone;

    private String status;

}