package com.soubhagya.pingme.websocket;

import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.soubhagya.pingme.websocket.UserStatusMessage;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void handleConnect(SessionConnectEvent event){

        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(event.getMessage());

        Object emailObj =
                accessor.getSessionAttributes().get("email");

        if(emailObj == null){

            return;

        }

        String email = emailObj.toString();

        User user =
                userRepository.findByEmail(email)
                        .orElse(null);

        if(user != null){

            user.setOnline(true);

            userRepository.save(user);

            messagingTemplate.convertAndSend(

        "/topic/status",

        UserStatusMessage.builder()

                .userId(user.getId())

                .fullName(user.getFullName())

                .online(true)

                .build()

);

            System.out.println(user.getFullName() + " is ONLINE");

        }

    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event){

        StompHeaderAccessor accessor =
                StompHeaderAccessor.wrap(event.getMessage());

        Object emailObj =
                accessor.getSessionAttributes().get("email");

        if(emailObj == null){

            return;

        }

        String email = emailObj.toString();

        User user =
                userRepository.findByEmail(email)
                        .orElse(null);

        if(user != null){

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

}