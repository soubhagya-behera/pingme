package com.soubhagya.pingme.service;

import com.soubhagya.pingme.exception.RateLimitExceededException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * H8: Lightweight in-memory sliding-window rate limiter.
 * No Redis required — suitable for single-instance or small deployments.
 * Keeps limits configurable via application properties and returns 429 on exceed.
 * Uses per-key (endpoint + identifier) window; auto-evicts expired entries.
 */
@Slf4j
@Service
public class RateLimitService {

    private final ConcurrentHashMap<String, Deque<Instant>> buckets = new ConcurrentHashMap<>();

    @Value("${app.rate-limit.login:5}")
    private int loginLimit;

    @Value("${app.rate-limit.login-window-seconds:60}")
    private int loginWindow;

    @Value("${app.rate-limit.forgot-password:3}")
    private int forgotLimit;

    @Value("${app.rate-limit.forgot-password-window-seconds:60}")
    private int forgotWindow;

    @Value("${app.rate-limit.reset-password:5}")
    private int resetLimit;

    @Value("${app.rate-limit.reset-password-window-seconds:60}")
    private int resetWindow;

    @Value("${app.rate-limit.otp:3}")
    private int otpLimit;

    @Value("${app.rate-limit.otp-window-seconds:60}")
    private int otpWindow;

    @Value("${app.rate-limit.chat-send:30}")
    private int chatSendLimit;

    @Value("${app.rate-limit.chat-send-window-seconds:60}")
    private int chatSendWindow;

    public void checkLogin(String key) {
        check("login:" + key, loginLimit, Duration.ofSeconds(loginWindow));
    }

    public void checkForgotPassword(String key) {
        check("forgot:" + key, forgotLimit, Duration.ofSeconds(forgotWindow));
    }

    public void checkResetPassword(String key) {
        check("reset:" + key, resetLimit, Duration.ofSeconds(resetWindow));
    }

    public void checkOtp(String key) {
        check("otp:" + key, otpLimit, Duration.ofSeconds(otpWindow));
    }

    public void checkChatSend(String key) {
        check("chatSend:" + key, chatSendLimit, Duration.ofSeconds(chatSendWindow));
    }

    private void check(String bucketKey, int maxRequests, Duration window) {
        Instant now = Instant.now();
        Instant windowStart = now.minus(window);
        Deque<Instant> deque = buckets.computeIfAbsent(bucketKey, k -> new ConcurrentLinkedDeque<>());
        synchronized (deque) {
            while (!deque.isEmpty() && deque.peekFirst().isBefore(windowStart)) {
                deque.pollFirst();
            }
            if (deque.size() >= maxRequests) {
                Instant oldest = deque.peekFirst();
                long retryAfter = Duration.between(now, oldest.plus(window)).getSeconds();
                if (retryAfter < 1) retryAfter = 1;
                log.warn("[RATE-LIMIT] bucket={} size={} limit={} window={}s", bucketKey, deque.size(), maxRequests, window.getSeconds());
                throw new RateLimitExceededException("Too many requests. Please try again later.", (int) retryAfter);
            }
            deque.addLast(now);
        }
        // opportunistic cleanup of empty buckets
        if (deque.isEmpty()) buckets.remove(bucketKey, deque);
    }

    // For testing
    void clearAll() { buckets.clear(); }
}
