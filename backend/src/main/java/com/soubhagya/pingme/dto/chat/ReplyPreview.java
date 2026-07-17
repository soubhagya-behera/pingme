package com.soubhagya.pingme.dto.chat;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReplyPreview {

    private Long id;

    private Long senderId;

    private String content;

}