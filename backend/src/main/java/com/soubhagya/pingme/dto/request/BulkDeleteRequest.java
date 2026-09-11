package com.soubhagya.pingme.dto.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkDeleteRequest {
    private List<Long> messageIds;
}
