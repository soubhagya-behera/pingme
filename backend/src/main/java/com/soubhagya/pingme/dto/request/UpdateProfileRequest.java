package com.soubhagya.pingme.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(max = 100, message = "Full name must be at most 100 characters")
    private String fullName;

    @Size(max = 100, message = "Profession must be at most 100 characters")
    private String profession;

    @Size(max = 1000, message = "Bio must be at most 1000 characters")
    private String bio;

    @Size(max = 30, message = "Phone must be at most 30 characters")
    private String phone;

}