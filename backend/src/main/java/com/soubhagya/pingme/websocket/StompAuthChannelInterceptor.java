package com.soubhagya.pingme.websocket;

import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.List;

/**
 * Validates the JWT on STOMP CONNECT and binds the authenticated principal to the
 * session so per-frame sender identity cannot be spoofed. Falls back to the
 * handshake identity established from the SockJS query token when no STOMP
 * Authorization header is present (SockJS/XHR compatibility).
 */
@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = extractBearerToken(accessor);
            if (token != null) {
                authenticate(accessor, token);
            }
            // Without a header token, keep the handshake principal (query token validated
            // in JwtHandshakeInterceptor). Reject only when neither exists.
            if (accessor.getUser() == null) {
                throw new IllegalArgumentException("Authenticated STOMP connection required");
            }
            return message;
        }

        // For SUBSCRIBE/SEND frames, re-validate a supplied header token when present.
        // Frames without a header keep the CONNECT/handshake principal.
        String token = extractBearerToken(accessor);
        if (token != null) {
            authenticate(accessor, token);
        }
        return message;
    }

    private String extractBearerToken(StompHeaderAccessor accessor) {
        List<String> values = accessor.getNativeHeader("Authorization");
        if (values == null || values.isEmpty()) {
            return null;
        }
        String header = values.get(0);
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }
        String token = header.substring(7).trim();
        return token.isEmpty() ? null : token;
    }

    private void authenticate(StompHeaderAccessor accessor, String token) {
        String email;
        try {
            email = jwtService.extractUsername(token);
        } catch (RuntimeException ex) {
            throw new IllegalArgumentException("Invalid STOMP credentials");
        }
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Invalid STOMP credentials");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid STOMP credentials"));
        long expectedVersion = user.getTokenVersion() == null ? 0L : user.getTokenVersion();
        if (!jwtService.isTokenValid(token, user.getUsername(), expectedVersion)) {
            throw new IllegalArgumentException("Invalid STOMP credentials");
        }
        Principal principal = accessor.getUser();
        if (principal == null || !email.equals(principal.getName())) {
            principal = new EmailPrincipal(email);
            accessor.setUser(principal);
        }
        accessor.setHeader("simpUser", principal);
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(email, null, user.getAuthorities());
        accessor.setHeader("simpAuthentication", authentication);
    }
}
