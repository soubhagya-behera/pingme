package com.soubhagya.pingme.config;

import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.AuthProvider;
import com.soubhagya.pingme.enums.UserRole;
import com.soubhagya.pingme.enums.UserStatus;
import com.soubhagya.pingme.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    @Value("${pingme.admin.name}")
    private String adminName;

    @Value("${pingme.admin.email}")
    private String adminEmail;

    @Value("${pingme.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {

        if (userRepository.existsByEmail(adminEmail)) {

            System.out.println("✅ Admin already exists.");

            return;

        }

        User admin = User.builder()

                .fullName(adminName)

                .email(adminEmail)

                .password(passwordEncoder.encode(adminPassword))

                .role(UserRole.ADMIN)

                .status(UserStatus.APPROVED)

                .online(false)

                .mustChangePassword(false)

                .emailVerified(true)

                .authProvider(AuthProvider.LOCAL)

                .build();

        userRepository.save(admin);

        System.out.println("==========================================");
        System.out.println("ADMIN CREATED SUCCESSFULLY");
        System.out.println("Email : " + adminEmail);
        System.out.println("==========================================");
    }
}