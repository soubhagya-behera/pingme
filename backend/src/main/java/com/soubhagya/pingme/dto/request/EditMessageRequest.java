package com.soubhagya.pingme.dto.request;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EditMessageRequest {

    @Size(max = 4000, message = "Message content must be at most 4000 characters")
    private String content;

}