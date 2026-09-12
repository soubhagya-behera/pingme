package com.soubhagya.pingme.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final UploadProperties uploadProperties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // Only profile photos are served through the resource handler (authenticated
        // users only, preserving the previous visibility). Chat files/images are served
        // exclusively through the authenticated /api/files controller, which enforces
        // sender/receiver access � no static handler exists for them here.
        Path profileUploadPath = Paths.get(
                uploadProperties.getProfileImageDirectory()
        ).toAbsolutePath().normalize();
        registry
                .addResourceHandler("/uploads/profile-photos/**")
                .addResourceLocations(profileUploadPath.toUri().toString() + "/");

    }
}
