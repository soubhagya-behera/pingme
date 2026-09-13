package com.soubhagya.pingme.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordChangeRequest {

    @NotBlank(message = "Current password is required")
    @Size(max = 64, message = "Password must be at most 64 characters")
    private String currentPassword;

    @NotBlank(message = "New password is required")
    @Size(min = 8, max = 64, message = "Password must be between 8 and 64 characters")
    private String newPassword;

    @NotBlank(message = "Confirm password is required")
    @Size(min = 8, max = 64, message = "Password must be between 8 and 64 characters")
    private String confirmPassword;

}