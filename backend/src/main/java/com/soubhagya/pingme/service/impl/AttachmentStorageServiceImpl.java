package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.config.UploadProperties;
import com.soubhagya.pingme.dto.response.AttachmentUploadResponse;
import com.soubhagya.pingme.exception.AttachmentStorageException;
import com.soubhagya.pingme.exception.InvalidAttachmentException;
import com.soubhagya.pingme.service.AttachmentStorageService;
import jakarta.annotation.PostConstruct;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import javax.imageio.ImageIO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AttachmentStorageServiceImpl implements AttachmentStorageService {
    private static final Map<String, String> ALLOWED_TYPES = Map.ofEntries(
            Map.entry("jpg", "image/jpeg"), Map.entry("jpeg", "image/jpeg"),
            Map.entry("png", "image/png"), Map.entry("gif", "image/gif"),
            Map.entry("pdf", "application/pdf"), Map.entry("doc", "application/msword"),
            Map.entry("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
            Map.entry("xls", "application/vnd.ms-excel"),
            Map.entry("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
            Map.entry("ppt", "application/vnd.ms-powerpoint"),
            Map.entry("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
            Map.entry("zip", "application/zip"), Map.entry("txt", "text/plain"),
            Map.entry("webm", "audio/webm"), Map.entry("weba", "audio/webm"),
            Map.entry("ogg", "audio/ogg"), Map.entry("oga", "audio/ogg"),
            Map.entry("opus", "audio/ogg"),
            Map.entry("m4a", "audio/mp4"), Map.entry("mp4", "audio/mp4"),
            Map.entry("mp3", "audio/mpeg"), Map.entry("wav", "audio/wav"));

    private final UploadProperties uploadProperties;
    private Path uploadPath;

    @PostConstruct
    void init() {
        try {
            uploadPath = Paths.get(uploadProperties.getFileDirectory()).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
        } catch (IOException ex) {
            throw new AttachmentStorageException("Could not initialize attachment storage.", ex);
        }
    }

    @Override
    public AttachmentUploadResponse upload(MultipartFile file) {
        ValidatedAttachment validated = validate(file);
        for (int attempt = 0; attempt < 3; attempt++) {
            String storedName = UUID.randomUUID() + "." + validated.extension();
            Path target = uploadPath.resolve(storedName).normalize();
            if (!target.startsWith(uploadPath)) {
                throw new InvalidAttachmentException("Invalid attachment filename.");
            }
            try (InputStream input = file.getInputStream()) {
                Files.copy(input, target);
                return AttachmentUploadResponse.builder()
                        .attachmentUrl("/uploads/chat-files/" + storedName)
                        .attachmentName(validated.originalFilename())
                        .attachmentSize(file.getSize())
                        .attachmentMimeType(validated.mimeType())
                        .build();
            } catch (FileAlreadyExistsException ignored) {
                // A new UUID is generated for the next attempt.
            } catch (IOException ex) {
                throw new AttachmentStorageException("Attachment upload failed.", ex);
            }
        }
        throw new AttachmentStorageException("Could not allocate an attachment filename.", null);
    }

    @Override
    public boolean isManagedAttachment(String attachmentUrl) {
        if (!StringUtils.hasText(attachmentUrl) || !attachmentUrl.startsWith("/uploads/chat-files/")) return false;
        String storedName = attachmentUrl.substring("/uploads/chat-files/".length());
        if (!storedName.matches("[0-9a-fA-F-]{36}\\.[a-z0-9]+")) return false;
        Path target = uploadPath.resolve(storedName).normalize();
        return target.startsWith(uploadPath) && Files.isRegularFile(target);
    }

    @Override
    public boolean isManagedAttachment(String attachmentUrl, Long attachmentSize, String attachmentMimeType) {
        if (!isManagedAttachment(attachmentUrl) || attachmentSize == null) return false;
        String storedName = attachmentUrl.substring("/uploads/chat-files/".length());
        String extension = StringUtils.getFilenameExtension(storedName);
        Path target = uploadPath.resolve(storedName).normalize();
        try {
            return attachmentSize == Files.size(target)
                    && ALLOWED_TYPES.get(extension).equals(normalizeContentType(attachmentMimeType));
        } catch (IOException ex) {
            return false;
        }
    }

    private ValidatedAttachment validate(MultipartFile file) {
        if (file == null || file.isEmpty() || file.getSize() == 0) {
            throw new InvalidAttachmentException("Please select a non-empty file.");
        }
        if (file.getSize() > uploadProperties.getMaxFileSizeBytes()) {
            throw new InvalidAttachmentException("Maximum attachment size is 10 MB.");
        }
        String originalFilename = file.getOriginalFilename();
        if (!isSafeOriginalFilename(originalFilename)) {
            throw new InvalidAttachmentException("Invalid attachment filename.");
        }
        String extension = StringUtils.getFilenameExtension(originalFilename);
        if (!StringUtils.hasText(extension)) {
            throw new InvalidAttachmentException("The attachment filename must have an extension.");
        }
        extension = extension.toLowerCase(Locale.ROOT);
        String expectedType = ALLOWED_TYPES.get(extension);
        String suppliedType = normalizeContentType(file.getContentType());
        if (expectedType == null || !expectedType.equals(suppliedType)) {
            throw new InvalidAttachmentException("Unsupported file type or mismatched filename extension.");
        }
        if (expectedType.startsWith("image/")) validateImage(file);
        return new ValidatedAttachment(originalFilename, extension, expectedType);
    }

    private boolean isSafeOriginalFilename(String filename) {
        return StringUtils.hasText(filename)
                && filename.length() <= 255
                && !filename.contains("/") && !filename.contains("\\")
                && !filename.contains("..")
                && filename.chars().noneMatch(Character::isISOControl);
    }

    private String normalizeContentType(String contentType) {
        if (!StringUtils.hasText(contentType)) return "";
        int separator = contentType.indexOf(';');
        return (separator >= 0 ? contentType.substring(0, separator) : contentType).trim().toLowerCase(Locale.ROOT);
    }

    private void validateImage(MultipartFile file) {
        try (InputStream input = file.getInputStream()) {
            BufferedImage image = ImageIO.read(input);
            if (image == null || image.getWidth() <= 0 || image.getHeight() <= 0) {
                throw new InvalidAttachmentException("The uploaded image is invalid.");
            }
        } catch (IOException ex) {
            throw new InvalidAttachmentException("The uploaded image is corrupted or unreadable.");
        }
    }

    private record ValidatedAttachment(String originalFilename, String extension, String mimeType) { }
}
