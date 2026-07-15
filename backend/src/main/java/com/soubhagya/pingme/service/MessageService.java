package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.response.ChatSidebarResponse;
import com.soubhagya.pingme.dto.response.MessageResponse;
import com.soubhagya.pingme.dto.response.RecentChatResponse;

import java.util.List;

public interface MessageService {

    List<MessageResponse> getChatHistory(
            String email,
            Long friendId
    );

    List<RecentChatResponse> getRecentChats(String email);

    // ⭐ NEW
    List<ChatSidebarResponse> getChatSidebar(String email);

}