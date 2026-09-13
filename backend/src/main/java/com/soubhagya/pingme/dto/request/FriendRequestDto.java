package com.soubhagya.pingme.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class FriendRequestDto {

    @NotNull(message = "Receiver Id is required")
    @Positive(message = "Receiver Id must be positive")
    private Long receiverId;

}