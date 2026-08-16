package com.soubhagya.pingme.service;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Component
public class ActiveChatTracker {

    private final ConcurrentMap<Long, Long> activeChatByUserId =
            new ConcurrentHashMap<>();

    public void setActiveChat(Long userId, Long friendId) {

        if (userId == null) {
            return;
        }

        if (friendId == null) {
            activeChatByUserId.remove(userId);
            return;
        }

        activeChatByUserId.put(userId, friendId);

    }

    public void clearActiveChat(Long userId) {

        activeChatByUserId.remove(userId);

    }

    public boolean isViewingChat(Long userId, Long friendId) {

        if (userId == null || friendId == null) {
            return false;
        }

        return friendId.equals(
                activeChatByUserId.get(userId)
        );

    }

}