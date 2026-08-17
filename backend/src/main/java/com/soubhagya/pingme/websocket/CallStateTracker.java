package com.soubhagya.pingme.websocket;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class CallStateTracker {

    public record CallSession(
            String callId,
            String callerEmail,
            String receiverEmail,
            String callType,
            LocalDateTime connectedAt
    ) {}

    private final ConcurrentHashMap<String, CallSession> sessions = new ConcurrentHashMap<>();

    private final ConcurrentHashMap<String, String> callByUser = new ConcurrentHashMap<>();

    private final ConcurrentHashMap<String, String> pendingOffers = new ConcurrentHashMap<>();

    public boolean isInCall(String email) {
        return callByUser.containsKey(email);
    }

    public CallSession activeCallFor(String email) {
        String callId = callByUser.get(email);
        return callId == null ? null : sessions.get(callId);
    }

    public void beginCall(String callId, String callerEmail, String receiverEmail, String callType) {
        CallSession session = new CallSession(callId, callerEmail, receiverEmail, callType, null);
        sessions.put(callId, session);
        callByUser.put(callerEmail, callId);
        callByUser.put(receiverEmail, callId);
    }

    public void markConnected(String callId) {
        CallSession session = sessions.get(callId);
        if (session == null || session.connectedAt() != null) {
            return;
        }
        sessions.put(callId, new CallSession(
                session.callId(),
                session.callerEmail(),
                session.receiverEmail(),
                session.callType(),
                LocalDateTime.now()
        ));
    }

    public void rememberPendingOffer(String callId, String callerEmail) {
        if (callId != null) {
            pendingOffers.put(callId, callerEmail);
        }
    }

    public String consumePendingOffer(String callId) {
        return callId == null ? null : pendingOffers.remove(callId);
    }

    public void forgetPendingOffer(String callId) {
        if (callId != null) {
            pendingOffers.remove(callId);
        }
    }

    public void endCallFor(String email) {
        String callId = callByUser.remove(email);
        if (callId == null) return;
        CallSession session = sessions.get(callId);
        if (session == null) return;
        String peer = session.callerEmail().equals(email)
                ? session.receiverEmail()
                : session.callerEmail();
        callByUser.remove(peer);
        sessions.remove(callId);
    }

    public void endCallById(String callId) {
        if (callId == null) return;
        CallSession session = sessions.remove(callId);
        if (session == null) return;
        callByUser.remove(session.callerEmail(), callId);
        callByUser.remove(session.receiverEmail(), callId);
        pendingOffers.remove(callId);
    }

    public Map<String, String> currentCalls() {
        return Map.copyOf(callByUser);
    }
}