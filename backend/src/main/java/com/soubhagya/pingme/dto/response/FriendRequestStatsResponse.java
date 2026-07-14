package com.soubhagya.pingme.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRequestStatsResponse {

    private long pending;

    private long today;

    private long sent;

}