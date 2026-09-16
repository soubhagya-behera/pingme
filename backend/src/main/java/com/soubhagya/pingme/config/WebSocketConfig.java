package com.soubhagya.pingme.config;

import com.soubhagya.pingme.websocket.JwtHandshakeInterceptor;
import com.soubhagya.pingme.websocket.JwtHandshakeHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

/**
 * H5: WebSocket origin configuration aligned with CorsConfig.
 * Uses explicit allowed origins (no wildcard, no setAllowedOriginPatterns("*")).
 * Dev default: http://localhost:5173
 * Prod: override via env var APP_WS_ALLOWED_ORIGINS or property app.ws.allowed-origins
 *        without source modification, e.g. APP_WS_ALLOWED_ORIGINS=https://app.example.com
 * Separate property intentionally retained — allows distinct API vs WS origins if needed;
 * both default identically and are documented as consistent.
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;
    private final JwtHandshakeHandler jwtHandshakeHandler;

    private final com.soubhagya.pingme.websocket.StompAuthChannelInterceptor stompAuthChannelInterceptor;

    @Value("${app.ws.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    /**
     * B-W2: dedicated scheduler drives STOMP heartbeats on the simple
     * broker so half-open TCP connections are detected instead of going
     * silently stale. Pool of 1 is sufficient for heartbeat frames.
     */
    @Bean
    public TaskScheduler webSocketTaskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(1);
        scheduler.setThreadNamePrefix("ws-heartbeat-");
        scheduler.setDaemon(true);
        scheduler.initialize();
        return scheduler;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {

        registry.addEndpoint("/ws")
                .addInterceptors(jwtHandshakeInterceptor)
                .setHandshakeHandler(jwtHandshakeHandler)
                .setAllowedOrigins(parseOrigins())
                .withSockJS();

    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Validates Authorization on STOMP CONNECT/SUBSCRIBE/SEND so the authenticated
        // handshake identity cannot be spoofed per frame.
        registration.interceptors(stompAuthChannelInterceptor);
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {

        // B-W2: explicit 10s/10s heartbeats on the simple broker
        // (driven by webSocketTaskScheduler) so the client and broker
        // detect half-open connections instead of silently going stale.
        registry.enableSimpleBroker("/queue", "/topic")
                .setHeartbeatValue(new long[] {10000, 10000})
                .setTaskScheduler(webSocketTaskScheduler());

        registry.setApplicationDestinationPrefixes("/app");

        registry.setUserDestinationPrefix("/user");

    }

    /**
     * B-W8: bound WebSocket transport resources. PingMe carries chat
     * signalling frames over STOMP (attachments travel over REST), so
     * these limits reject pathological frames without affecting normal use.
     */
    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.setMessageSizeLimit(128 * 1024);
        registration.setSendTimeLimit(15 * 1000);
        registration.setSendBufferSizeLimit(512 * 1024);
    }

    private String[] parseOrigins() {
        String[] origins = java.util.Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toArray(String[]::new);
        if (origins.length == 0) {
            return new String[] {"http://localhost:5173"};
        }
        return origins;
    }

}
