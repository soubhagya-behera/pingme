package com.soubhagya.pingme.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMessageStatusRequest {

    @NotNull(message = "messageId is required")
    @Positive(message = "messageId must be positive")
    private Long messageId;

}