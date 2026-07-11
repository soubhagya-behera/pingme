package com.soubhagya.pingme.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SendPasswordOtpRequest {

    @NotBlank
    @Email
    private String email;

}