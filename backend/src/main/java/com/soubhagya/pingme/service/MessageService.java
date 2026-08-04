package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.response.ChatSidebarResponse;
import com.soubhagya.pingme.dto.response.MessageResponse;
import com.soubhagya.pingme.dto.response.RecentChatResponse;

import java.util.List;
import org.springframework.data.domain.Page;

public interface MessageService {

    Page<MessageResponse> getChatHistory(
        String email,
        Long friendId,
        int page,
        int size
);

    List<RecentChatResponse> getRecentChats(String email);

    // ⭐ NEW
    List<ChatSidebarResponse> getChatSidebar(String email);

}