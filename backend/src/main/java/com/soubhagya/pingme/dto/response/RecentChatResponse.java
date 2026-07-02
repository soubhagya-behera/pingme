package com.soubhagya.pingme.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RecentChatResponse {

    private Long friendId;

    private String fullName;

    private String profilePicture;

    private Boolean online;

    private String lastMessage;

    private LocalDateTime lastMessageTime;

}