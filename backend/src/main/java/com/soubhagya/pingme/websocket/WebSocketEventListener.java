package com.soubhagya.pingme.websocket;

import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final UserRepository userRepository;

    private final SimpMessagingTemplate messagingTemplate;

    private final UserSessionTracker sessionTracker;

   @EventListener
public void handleConnect(SessionConnectEvent event) {

    StompHeaderAccessor accessor =
            StompHeaderAccessor.wrap(event.getMessage());

    Object emailObj = null;

    if (accessor.getSessionAttributes() != null) {
        emailObj = accessor.getSessionAttributes().get("email");
    }

    System.out.println("Email : " + emailObj);

    if (emailObj == null) {

        System.out.println("Email is NULL");

        return;
    }

    String email = emailObj.toString();

    sessionTracker.connected(email, accessor.getSessionId());

    User user =
            userRepository.findByEmail(email)
                    .orElse(null);

    System.out.println("User From DB : " + user);

    if (user == null) {

        System.out.println("USER NOT FOUND");

        return;
    }

    user.setOnline(true);

    userRepository.save(user);

    System.out.println("Saved user online=true");

    messagingTemplate.convertAndSend(

            "/topic/status",

            UserStatusMessage.builder()

                    .userId(user.getId())

                    .fullName(user.getFullName())

                    .online(true)

                    .build()

    );
}

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {

        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(event.getMessage());

        Object emailObj = accessor.getSessionAttributes() == null ? null :
                accessor.getSessionAttributes().get("email");

        if (emailObj == null) {
            return;
        }

        String email = emailObj.toString();

        System.out.println("DISCONNECT EVENT");

        // If another WebSocket session is still active,
        // don't mark the user offline.
        if (!sessionTracker.disconnected(email, accessor.getSessionId())) {

            System.out.println(email + " still has active sessions.");

            return;

        }

        User user =
                userRepository.findByEmail(email)
                        .orElse(null);

        if (user == null) {
            return;
        }

        user.setOnline(false);

        userRepository.save(user);

        messagingTemplate.convertAndSend(

                "/topic/status",

                UserStatusMessage.builder()

                        .userId(user.getId())

                        .fullName(user.getFullName())

                        .online(false)

                        .build()

        );

        System.out.println(user.getFullName() + " is OFFLINE");
    }

}
