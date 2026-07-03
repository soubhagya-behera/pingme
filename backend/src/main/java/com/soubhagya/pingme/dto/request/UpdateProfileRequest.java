package com.soubhagya.pingme.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {

    private String fullName;

    private String profession;

    private String bio;

    private String phone;

}