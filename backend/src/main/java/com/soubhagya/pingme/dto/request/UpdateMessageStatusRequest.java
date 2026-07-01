package com.soubhagya.pingme.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMessageStatusRequest {

    private Long messageId;

}