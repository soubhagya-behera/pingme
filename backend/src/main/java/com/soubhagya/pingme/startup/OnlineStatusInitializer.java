package com.soubhagya.pingme.startup;

import com.soubhagya.pingme.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OnlineStatusInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) {

        userRepository.resetAllUsersOffline();

        System.out.println("All users marked OFFLINE.");

    }
}