package com.soubhagya.pingme.dto.request;

import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActiveConversationRequest {

    @Positive(message = "friendId must be positive")
    private Long friendId;

}