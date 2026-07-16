package com.soubhagya.pingme.websocket;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class UserSessionTracker {
    private final ConcurrentHashMap<String, Set<String>> sessions = new ConcurrentHashMap<>();

    public void connected(String email, String sessionId) {
        sessions.computeIfAbsent(email, ignored -> ConcurrentHashMap.newKeySet()).add(sessionId);
    }

    /** Returns true only when the final session for this user has gone away. */
    public boolean disconnected(String email, String sessionId) {
        Set<String> userSessions = sessions.get(email);
        if (userSessions == null) return true;
        userSessions.remove(sessionId);
        if (!userSessions.isEmpty()) return false;
        sessions.remove(email, userSessions);
        return true;
    }
}
