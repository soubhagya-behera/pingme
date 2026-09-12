package com.soubhagya.pingme.websocket;

import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   org.springframework.http.server.ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) {

        if (request instanceof ServletServerHttpRequest servletRequest) {

            // Preferred: Authorization header (native WebSocket clients).
            // Fallback: ?token= query param for SockJS/XHR transports that cannot set
            // headers during the HTTP handshake. Both are validated the same way.
            String token = servletRequest.getServletRequest().getHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7).trim();
            } else {
                token = servletRequest.getServletRequest().getParameter("token");
            }

            if (token == null || token.isBlank() || "null".equals(token) || "undefined".equals(token)) {
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

            try {
                String email = jwtService.extractUsername(token);

                if (email == null || email.isBlank()) {
                    response.setStatusCode(HttpStatus.UNAUTHORIZED);
                    return false;
                }

                final String tokenToValidate = token;
                boolean authorized = userRepository.findByEmail(email)
                        .map(user -> {
                            long current = user.getTokenVersion() == null ? 0L : user.getTokenVersion();
                            return jwtService.isTokenValid(tokenToValidate, user.getUsername(), current);
                        })
                        .orElse(false);
                if (!authorized) {
                    response.setStatusCode(HttpStatus.UNAUTHORIZED);
                    return false;
                }

                attributes.put("email", email);
            } catch (RuntimeException exception) {
                // Reject malformed, expired, or otherwise invalid query tokens
                // without allowing a JWT parsing exception to escape the handshake.
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

        }

        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               org.springframework.http.server.ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {
    }
}
