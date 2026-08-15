package com.soubhagya.pingme.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForwardMessageRequest {

    @NotNull
    private Long receiverId;

}