package com.soubhagya.pingme.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String tokenHash;

    /** Number of failed verification attempts for the current OTP. */
    @Column(nullable = false, columnDefinition = "integer not null default 0")
    @Builder.Default
    private int attempts = 0;

    /** When set, the OTP is locked until this time after too many attempts. */
    private LocalDateTime lockedUntil;

    /**
     * Transient plaintext OTP. Only populated on the object returned from
     * {@code TokenService#createToken} so it can be emailed. It is never persisted;
     * only the SHA-256 hash is stored in {@code tokenHash}.
     */
    @Transient
    private String token;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}