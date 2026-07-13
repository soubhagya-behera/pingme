package com.soubhagya.pingme.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendStatsResponse {

    private long totalFriends;

    private long onlineFriends;

    private long offlineFriends;

}