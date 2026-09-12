package com.soubhagya.pingme.service;

import com.soubhagya.pingme.config.UploadProperties;
import com.soubhagya.pingme.entity.Message;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.repository.MessageRepository;
import com.soubhagya.pingme.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Authenticated file serving (C1, option A).
 *
 * <p>Private chat files/images are resolved from the stored UUID filename only and
 * served when the principal is the sender or receiver of a message referencing the
 * file. Profile photos remain visible to any authenticated user (existing behavior).
 * No arbitrary filesystem paths are ever exposed.</p>
 */
@Service
@RequiredArgsConstructor
public class SecureFileService {

    private final UploadProperties uploadProperties;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public Resource loadChatFile(String storedName) {
        return load(storedName, Kind.CHAT_FILE);
    }

    public Resource loadChatImage(String storedName) {
        return load(storedName, Kind.CHAT_IMAGE);
    }

    public Resource loadProfilePhoto(String storedName) {
        return load(storedName, Kind.PROFILE_PHOTO);
    }

    public void authorizeChatAccess(String attachmentUrl, String principalEmail) {
        if (!StringUtils.hasText(attachmentUrl) || !StringUtils.hasText(principalEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
        }
        boolean allowed = messageRepository.existsByAttachmentParticipant(attachmentUrl, principalEmail);
        if (!allowed) {
            // Fall back to a friendship-independent existence check message that does not
            // reveal whether the file exists for unauthorized principals.
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
        }
    }

    public void authorizeProfileAccess(String principalEmail) {
        if (!StringUtils.hasText(principalEmail)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }
        // Any authenticated user keeps the existing profile-photo visibility behavior.
        userRepository.findByEmail(principalEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required."));
    }

    private Resource load(String storedName, Kind kind) {
        String sanitized = sanitizeStoredName(storedName, kind);
        Path base = basePath(kind);
        Path target = base.resolve(sanitized).normalize();
        if (!target.startsWith(base) || !Files.isRegularFile(target) || !Files.isReadable(target)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found.");
        }
        try {
            return new UrlResource(target.toUri());
        } catch (MalformedURLException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found.");
        }
    }

    private Path basePath(Kind kind) {
        String directory = switch (kind) {
            case CHAT_FILE -> uploadProperties.getFileDirectory();
            case CHAT_IMAGE -> uploadProperties.getImageDirectory();
            case PROFILE_PHOTO -> uploadProperties.getProfileImageDirectory();
        };
        return Paths.get(directory).toAbsolutePath().normalize();
    }

    private String sanitizeStoredName(String storedName, Kind kind) {
        if (!StringUtils.hasText(storedName)
                || storedName.contains("/")
                || storedName.contains("\\")
                || storedName.contains("..")) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found.");
        }
        String pattern = switch (kind) {
            case CHAT_FILE -> "[0-9a-fA-F-]{36}\\.[a-z0-9]+";
            case CHAT_IMAGE, PROFILE_PHOTO -> "[0-9a-fA-F-]{36}\\.(jpg|jpeg|png|gif|webp)";
        };
        if (!storedName.matches(pattern)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found.");
        }
        return storedName;
    }

    private enum Kind {
        CHAT_FILE,
        CHAT_IMAGE,
        PROFILE_PHOTO
    }
}
