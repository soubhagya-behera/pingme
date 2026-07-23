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

    Path uploadPath = Paths.get(
            uploadProperties.getImageDirectory()
    ).toAbsolutePath().normalize();

    System.out.println("Serving uploads from : " + uploadPath);

    registry
            .addResourceHandler("/uploads/chat-images/**")
            .addResourceLocations(uploadPath.toUri().toString());

}

}