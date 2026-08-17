package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.dto.chat.CallSignal;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.repository.FriendRepository;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.CallService;
import com.soubhagya.pingme.service.NotificationService;
import com.soubhagya.pingme.websocket.CallStateTracker;
import com.soubhagya.pingme.websocket.CallStateTracker.CallSession;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CallServiceImpl implements CallService {

    private final UserRepository userRepository;
    private final FriendRepository friendRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final CallStateTracker callStateTracker;
    private final NotificationService notificationService;

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
            sendTo(caller.getEmail(), busySignal(signal, "User is not available right now"));
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
            notifyMissedCall(session, sender);
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

    private void notifyMissedCall(CallSession session, User caller) {
        try {
            User receiver = userRepository.findByEmail(session.receiverEmail())
                    .orElse(null);
            if (receiver == null) {
                return;
            }
            notificationService.createMissedCallNotification(
                    receiver.getId(),
                    caller.getId(),
                    caller.getFullName(),
                    session.callType()
            );
        } catch (Exception ignored) {
            // A missed-call notification failure must never break signaling.
        }
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