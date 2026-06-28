package com.soubhagya.pingme.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FriendRequestDto {

    @NotNull(message = "Sender Id is required")
    private Long senderId;

    @NotNull(message = "Receiver Id is required")
    private Long receiverId;

}