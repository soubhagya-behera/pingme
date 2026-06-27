package com.soubhagya.pingme.entity;

import com.soubhagya.pingme.enums.AuthProvider;
import com.soubhagya.pingme.enums.UserRole;
import com.soubhagya.pingme.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;
    @Column(nullable = false)
private String password;

    private String profilePicture;

    private String profession;

    private String bio;

    private String phone;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    @Enumerated(EnumType.STRING)
    private AuthProvider authProvider;

    @Column(nullable = false)
@Builder.Default
private Boolean online = false;

    private LocalDateTime lastSeen;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {

    createdAt = LocalDateTime.now();

    updatedAt = LocalDateTime.now();

    if (online == null)
        online = false;

}

@PreUpdate
public void preUpdate() {

    updatedAt = LocalDateTime.now();

}


@Override
public Collection<? extends GrantedAuthority> getAuthorities() {

    return List.of(
            new SimpleGrantedAuthority(role.name())
    );

}

@Override
public String getUsername() {

    return email;

}

@Override
public boolean isAccountNonExpired() {

    return true;

}

@Override
public boolean isAccountNonLocked() {

    return true;

}

@Override
public boolean isCredentialsNonExpired() {

    return true;

}

@Override
public boolean isEnabled() {

    return status == UserStatus.APPROVED;

}

}