package com.soubhagya.pingme.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActiveConversationRequest {

    private Long friendId;

}