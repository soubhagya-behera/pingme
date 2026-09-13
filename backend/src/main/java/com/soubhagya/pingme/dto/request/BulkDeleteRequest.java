package com.soubhagya.pingme.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkDeleteRequest {
    @NotEmpty(message = "At least one messageId is required")
    @Size(max = 100, message = "Cannot delete more than 100 messages at once")
    private List<@Positive(message = "messageId must be positive") Long> messageIds;
}
