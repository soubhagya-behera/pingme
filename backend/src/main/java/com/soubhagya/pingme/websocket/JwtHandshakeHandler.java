package com.soubhagya.pingme.websocket;

import java.security.Principal;
import java.util.Map;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

@Component
public class JwtHandshakeHandler extends DefaultHandshakeHandler {
    @Override
    protected Principal determineUser(ServerHttpRequest request, WebSocketHandler handler, Map<String, Object> attributes) {
        Object email = attributes.get("email");
        if (email == null) throw new IllegalArgumentException("Authenticated WebSocket connection required");
        return new EmailPrincipal(email.toString());
    }
}
