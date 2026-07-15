package com.soubhagya.pingme.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatSidebarResponse {

    private Long id;

    private String fullName;

    private String profilePicture;

    private Boolean online;

    private String lastMessage;

    private LocalDateTime lastMessageTime;

    @Builder.Default
    private Integer unreadCount = 0;

    @Builder.Default
    private Boolean typing = false;

}