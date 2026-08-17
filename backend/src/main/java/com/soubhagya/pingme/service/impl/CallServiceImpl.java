package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.dto.chat.CallSignal;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.MessageType;
import com.soubhagya.pingme.repository.FriendRepository;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.CallService;
import com.soubhagya.pingme.service.ChatService;
import com.soubhagya.pingme.service.NotificationService;
import com.soubhagya.pingme.websocket.CallStateTracker;
import com.soubhagya.pingme.websocket.CallStateTracker.CallSession;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CallServiceImpl implements CallService {

    private static final Logger log = LoggerFactory.getLogger(CallServiceImpl.class);

    private final UserRepository userRepository;
    private final FriendRepository friendRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final CallStateTracker callStateTracker;
    private final NotificationService notificationService;
    private final ChatService chatService;

    @Override
    public void handleSignal(CallSignal signal, String senderEmail) {
        if (signal == null || senderEmail == null) {
            throw new IllegalArgumentException("Call signal is required.");
        }

        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        String event = signal.getEvent();
        if (event == null || event.isBlank()) {
            throw new IllegalArgumentException("Call event is required.");
        }

        switch (event) {
            case "CALL_OFFER" -> handleOffer(signal, sender);
            case "CALL_ANSWER" -> handleAnswer(signal, sender);
            case "ICE_CANDIDATE" -> handleIceCandidate(signal, sender);
            case "CALL_REJECT" -> handleReject(signal, sender);
            case "CALL_END" -> handleEnd(signal, sender);
            case "CALL_TIMEOUT" -> handleTimeout(signal, sender);
            case "CALL_BUSY" -> handleBusy(signal, sender);
            default -> throw new IllegalArgumentException("Unsupported call event.");
        }
    }

    private void handleOffer(CallSignal signal, User caller) {
        Long receiverId = signal.getReceiverId();
        if (receiverId == null) {
            throw new IllegalArgumentException("Receiver is required.");
        }

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        if (caller.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException("You cannot call yourself.");
        }

        if (!areFriends(caller, receiver)) {
            throw new RuntimeException("You can only call accepted friends.");
        }

        String callType = signal.getCallType();
        if (callType == null || (!callType.equals("VOICE") && !callType.equals("VIDEO"))) {
            throw new IllegalArgumentException("Call type must be VOICE or VIDEO.");
        }

        if (signal.getSdp() == null || signal.getSdp().isBlank()) {
            throw new IllegalArgumentException("Call offer SDP is required.");
        }

        if (callStateTracker.isInCall(caller.getEmail())) {
            sendTo(caller.getEmail(), busySignal(signal, "You are already in a call"));
            return;
        }

        if (callStateTracker.isInCall(receiver.getEmail())) {
            sendTo(caller.getEmail(), busySignal(signal, "User is busy"));
            return;
        }

        if (!Boolean.TRUE.equals(receiver.getOnline())) {
            log.info("[CALL] Missed call: {} ({}) -> {} ({}), recipient offline",
                    caller.getEmail(), callType, receiver.getEmail(), receiverId);
            sendTo(caller.getEmail(), busySignal(signal, "User is not available right now"));
            notifyMissedCall(receiver, caller, callType);
            return;
        }

        String callId = (signal.getCallId() == null || signal.getCallId().isBlank())
                ? UUID.randomUUID().toString()
                : signal.getCallId();

        callStateTracker.beginCall(callId, caller.getEmail(), receiver.getEmail(), callType);
        callStateTracker.rememberPendingOffer(callId, caller.getEmail());

        CallSignal offer = CallSignal.builder()
                .callId(callId)
                .callerId(caller.getId())
                .receiverId(receiver.getId())
                .callerName(caller.getFullName())
                .callerProfilePicture(caller.getProfilePicture())
                .callType(callType)
                .event("CALL_OFFER")
                .sdp(signal.getSdp())
                .build();

        sendTo(receiver.getEmail(), offer);
    }

    private void handleAnswer(CallSignal signal, User sender) {
        CallSession session = callStateTracker.activeCallFor(sender.getEmail());
        if (session == null) {
            return;
        }
        if (sender.getEmail().equals(session.callerEmail())) {
            return;
        }
        if (signal.getSdp() == null || signal.getSdp().isBlank()) {
            throw new IllegalArgumentException("Call answer SDP is required.");
        }
        callStateTracker.forgetPendingOffer(signal.getCallId());
        callStateTracker.markConnected(session.callId());
        log.info("[CALL] Connected: {} <-> {} (callId={}, type={})",
                session.callerEmail(), session.receiverEmail(), session.callId(), session.callType());
        forward(signal, sender, "CALL_ANSWER");
    }

    private void handleIceCandidate(CallSignal signal, User sender) {
        CallSession session = callStateTracker.activeCallFor(sender.getEmail());
        if (session == null) {
            return;
        }
        if (signal.getCandidate() == null || signal.getCandidate().isBlank()) {
            return;
        }
        forward(signal, sender, "ICE_CANDIDATE");
    }

    private void handleReject(CallSignal signal, User sender) {
        CallSession session = callStateTracker.activeCallFor(sender.getEmail());
        if (session == null) {
            return;
        }
        String callId = session.callId();
        forward(signal, sender, "CALL_REJECT");
        callStateTracker.endCallById(callId);
    }

    private void handleEnd(CallSignal signal, User sender) {
        CallSession session = callStateTracker.activeCallFor(sender.getEmail());
        if (session == null) {
            return;
        }
        String callId = session.callId();
        forward(signal, sender, "CALL_END");
        callStateTracker.endCallById(callId);

        if (session.connectedAt() != null) {
            log.info("[CALL] Ended after connection: {} <-> {} (callId={}), writing call history",
                    session.callerEmail(), session.receiverEmail(), callId);
            createCallHistoryEntry(session, LocalDateTime.now());
        } else {
            log.info("[CALL] Ended without connection: {} <-> {} (callId={}), no history entry",
                    session.callerEmail(), session.receiverEmail(), callId);
        }
    }

    private void handleTimeout(CallSignal signal, User sender) {
        CallSession session = callStateTracker.activeCallFor(sender.getEmail());
        if (session == null) {
            return;
        }
        String callId = session.callId();
        boolean callerTimedOut = sender.getEmail().equals(session.callerEmail());
        forward(signal, sender, "CALL_TIMEOUT");
        callStateTracker.endCallById(callId);

        if (callerTimedOut) {
            notifyMissedCall(receiverFrom(session), sender, session.callType());
        }
    }

    private void handleBusy(CallSignal signal, User sender) {
        String callerEmail = callStateTracker.consumePendingOffer(signal.getCallId());
        if (callerEmail == null) {
            return;
        }
        sendTo(callerEmail, busySignal(signal, "User is busy"));
        callStateTracker.endCallById(signal.getCallId());
    }

    private User receiverFrom(CallSession session) {
        return userRepository.findByEmail(session.receiverEmail())
                .orElse(null);
    }

    private void notifyMissedCall(User receiver, User caller, String callType) {
        if (receiver == null || caller == null) {
            log.warn("[CALL] Missed-call skipped: receiver or caller resolved to null");
            return;
        }
        try {
            notificationService.createMissedCallNotification(
                    receiver.getId(),
                    caller.getId(),
                    caller.getFullName(),
                    callType
            );
            log.info("[CALL] Missed-call notification created for userId={} (caller={})",
                    receiver.getId(), caller.getEmail());
        } catch (Exception ex) {
            log.error("[CALL] Failed to create missed-call notification for userId="
                    + receiver.getId(), ex);
        }
    }

    private void createCallHistoryEntry(CallSession session, LocalDateTime endedAt) {
        try {
            User caller = userRepository.findByEmail(session.callerEmail())
                    .orElse(null);
            User receiver = userRepository.findByEmail(session.receiverEmail())
                    .orElse(null);
            if (caller == null || receiver == null) {
                return;
            }

            boolean isVideo = "VIDEO".equals(session.callType());
            String label = isVideo ? "Video call" : "Audio call";
            long durationSeconds = session.connectedAt() == null
                    ? 0
                    : Math.max(0, Duration.between(session.connectedAt(), endedAt).getSeconds());
            String content = label + " • " + formatCallDuration(durationSeconds);

            chatService.createCallHistoryMessage(
                    caller.getEmail(),
                    receiver.getEmail(),
                    isVideo ? MessageType.VIDEO_CALL : MessageType.AUDIO_CALL,
                    content,
                    endedAt
            );
            log.info("[CALL] Call-history message persisted for {} <-> {}: \"{}\"",
                    caller.getEmail(), receiver.getEmail(), content);
        } catch (Exception ex) {
            log.error("[CALL] Failed to persist call-history message for {} <-> {}",
                    session.callerEmail(), session.receiverEmail(), ex);
        }
    }

    private String formatCallDuration(long totalSeconds) {
        long hours = totalSeconds / 3600;
        long minutes = (totalSeconds % 3600) / 60;
        long seconds = totalSeconds % 60;
        String mm = String.format("%02d", minutes);
        String ss = String.format("%02d", seconds);
        return hours > 0
                ? String.format("%d:%s:%s", hours, mm, ss)
                : mm + ":" + ss;
    }

    private void forward(CallSignal signal, User sender, String event) {
        CallSession session = callStateTracker.activeCallFor(sender.getEmail());
        if (session == null) {
            return;
        }
        String peerEmail = session.callerEmail().equals(sender.getEmail())
                ? session.receiverEmail()
                : session.callerEmail();

        User caller = userRepository.findByEmail(session.callerEmail())
                .orElse(null);
        User receiver = userRepository.findByEmail(session.receiverEmail())
                .orElse(null);
        if (caller == null || receiver == null) {
            return;
        }

        CallSignal out = CallSignal.builder()
                .callId(session.callId())
                .callerId(caller.getId())
                .receiverId(receiver.getId())
                .callType(session.callType())
                .event(event)
                .sdp(event.equals("CALL_ANSWER") ? signal.getSdp() : null)
                .candidate(event.equals("ICE_CANDIDATE") ? signal.getCandidate() : null)
                .status(signal.getStatus())
                .build();

        sendTo(peerEmail, out);
    }

    private CallSignal busySignal(CallSignal signal, String status) {
        return CallSignal.builder()
                .callId(signal.getCallId())
                .callerId(signal.getCallerId())
                .receiverId(signal.getReceiverId())
                .callType(signal.getCallType())
                .event("CALL_BUSY")
                .status(status)
                .build();
    }

    private boolean areFriends(User a, User b) {
        return friendRepository.existsByUserOneAndUserTwoOrUserOneAndUserTwo(a, b, b, a);
    }

    private void sendTo(String email, CallSignal signal) {
        messagingTemplate.convertAndSendToUser(email, "/queue/call", signal);
    }
}