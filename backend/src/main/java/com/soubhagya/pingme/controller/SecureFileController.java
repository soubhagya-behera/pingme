package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.service.SecureFileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Authenticated media access (C1, option A).
 *
 * <p>URLs: /api/files/chat-files/{storedName}, /api/files/chat-images/{storedName},
 * /api/files/profile-photos/{storedName}. Chat media requires sender/receiver
 * participation; profile photos require any authenticated user (existing behavior).</p>
 */
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@org.springframework.validation.annotation.Validated
public class SecureFileController {

    private final SecureFileService secureFileService;

    @GetMapping("/chat-files/{storedName}")
    public ResponseEntity<Resource> chatFile(@PathVariable @jakarta.validation.constraints.Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "Invalid file name") String storedName,
                                             Authentication authentication) {
        String attachmentUrl = "/uploads/chat-files/" + storedName;
        secureFileService.authorizeChatAccess(attachmentUrl, authentication.getName());
        return serve(secureFileService.loadChatFile(storedName));
    }

    @GetMapping("/chat-images/{storedName}")
    public ResponseEntity<Resource> chatImage(@PathVariable @jakarta.validation.constraints.Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "Invalid file name") String storedName,
                                              Authentication authentication) {
        String attachmentUrl = "/uploads/chat-images/" + storedName;
        secureFileService.authorizeChatAccess(attachmentUrl, authentication.getName());
        return serve(secureFileService.loadChatImage(storedName));
    }

    @GetMapping("/profile-photos/{storedName}")
    public ResponseEntity<Resource> profilePhoto(@PathVariable @jakarta.validation.constraints.Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "Invalid file name") String storedName,
                                                 Authentication authentication) {
        secureFileService.authorizeProfileAccess(authentication.getName());
        return serve(secureFileService.loadProfilePhoto(storedName));
    }

    private ResponseEntity<Resource> serve(Resource resource) {
        MediaType mediaType = MediaTypeFactory.getMediaType(resource)
                .orElse(MediaType.APPLICATION_OCTET_STREAM);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .contentType(mediaType)
                .body(resource);
    }
}
