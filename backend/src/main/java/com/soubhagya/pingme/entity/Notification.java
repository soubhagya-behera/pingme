package com.soubhagya.pingme.entity;

import com.soubhagya.pingme.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // User who receives the notification
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private String title;

    private String message;

    @Column(nullable = false)
    @Builder.Default
    private Boolean read = false;

    private LocalDateTime createdAt;

    // The user who triggered the notification (e.g. friend request sender)
    private Long relatedUserId;

    @PrePersist
    public void prePersist() {

        if (createdAt == null)
            createdAt = LocalDateTime.now();

        if (read == null)
            read = false;

    }

}