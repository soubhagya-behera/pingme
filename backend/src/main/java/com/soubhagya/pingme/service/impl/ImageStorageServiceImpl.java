package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.config.UploadProperties;
import com.soubhagya.pingme.exception.ImageStorageException;
import com.soubhagya.pingme.exception.InvalidImageException;
import com.soubhagya.pingme.service.ImageStorageService;
import jakarta.annotation.PostConstruct;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.FileAlreadyExistsException;
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
public class ImageStorageServiceImpl implements ImageStorageService {
    private static final Map<String, String> ALLOWED_IMAGES = Map.of(
            "jpg", "image/jpeg", "jpeg", "image/jpeg", "png", "image/png", "gif", "image/gif");
    private static final Map<String, String> ALLOWED_PROFILE_IMAGES = Map.of(
            "jpg", "image/jpeg", "jpeg", "image/jpeg", "png", "image/png", "webp", "image/webp");
    private static final String STORED_FILE_PATTERN = "[0-9a-fA-F-]{36}\\.(jpg|jpeg|png|gif|webp)";
    private final UploadProperties uploadProperties;
    private Path uploadPath;
    private Path profileUploadPath;

    @PostConstruct
    public void init() {
        try {
            uploadPath = Paths.get(uploadProperties.getImageDirectory()).toAbsolutePath().normalize();
            profileUploadPath = Paths.get(uploadProperties.getProfileImageDirectory()).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
            Files.createDirectories(profileUploadPath);
        } catch (IOException ex) {
            throw new ImageStorageException("Could not initialize image storage.", ex);
        }
    }

    @Override
    public String upload(MultipartFile file) {
        String extension = validate(file);
        return write(uploadPath, extension, file, "/uploads/chat-images/");
    }

    @Override
    public String uploadProfilePhoto(MultipartFile file) {
        String extension = validateProfilePhoto(file);
        return write(profileUploadPath, extension, file, "/uploads/profile-photos/");
    }

    private String write(Path directory, String extension, MultipartFile file, String urlPrefix) {
        for (int attempt = 0; attempt < 3; attempt++) {
            String fileName = UUID.randomUUID() + "." + extension;
            Path target = directory.resolve(fileName).normalize();
            if (!target.startsWith(directory)) throw new InvalidImageException("Invalid image filename.");
            try (InputStream input = file.getInputStream()) {
                Files.copy(input, target);
                return urlPrefix + fileName;
            } catch (FileAlreadyExistsException ignored) {
                // UUID collisions are extraordinarily unlikely, but never overwrite an existing upload.
            } catch (IOException ex) {
                throw new ImageStorageException("Image upload failed.", ex);
            }
        }
        throw new ImageStorageException("Could not allocate an image filename.", null);
    }

    @Override
    public boolean isManagedImage(String imageUrl) {
        if (!StringUtils.hasText(imageUrl) || !imageUrl.startsWith("/uploads/chat-images/")) return false;
        String storedName = imageUrl.substring("/uploads/chat-images/".length());
        if (!storedName.matches("[0-9a-fA-F-]{36}\\.(jpg|jpeg|png|gif)")) return false;
        Path target = uploadPath.resolve(storedName).normalize();
        return target.startsWith(uploadPath) && Files.isRegularFile(target);
    }

    @Override
    public void delete(String imageUrl) {
        if (!StringUtils.hasText(imageUrl)) return;
        String storedName = null;
        if (imageUrl.startsWith("/uploads/chat-images/")) {
            storedName = imageUrl.substring("/uploads/chat-images/".length());
        } else if (imageUrl.startsWith("/uploads/profile-photos/")) {
            storedName = imageUrl.substring("/uploads/profile-photos/".length());
        }
        if (storedName == null || !storedName.matches(STORED_FILE_PATTERN)) return;
        Path base = imageUrl.startsWith("/uploads/profile-photos/") ? profileUploadPath : uploadPath;
        Path target = base.resolve(storedName).normalize();
        if (!target.startsWith(base)) return;
        try {
            Files.deleteIfExists(target);
        } catch (IOException ignored) {
            // Best-effort cleanup must never break the request.
        }
    }

    private String validate(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new InvalidImageException("Please select a non-empty image.");
        if (file.getSize() > uploadProperties.getMaxImageSizeBytes()) throw new InvalidImageException("Maximum image size is 10 MB.");
        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        if (!StringUtils.hasText(extension)) throw new InvalidImageException("The image filename must have an extension.");
        extension = extension.toLowerCase(Locale.ROOT);
        String expectedType = ALLOWED_IMAGES.get(extension);
        if (expectedType == null || !expectedType.equalsIgnoreCase(file.getContentType()))
            throw new InvalidImageException("Unsupported image format or mismatched filename extension.");
        try (InputStream input = file.getInputStream()) {
            BufferedImage image = ImageIO.read(input);
            if (image == null || image.getWidth() <= 0 || image.getHeight() <= 0)
                throw new InvalidImageException("The uploaded file is not a valid image.");
        } catch (IOException ex) {
            throw new InvalidImageException("The uploaded image is corrupted or unreadable.");
        }
        return extension;
    }

    private String validateProfilePhoto(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new InvalidImageException("Please select a non-empty image.");
        if (file.getSize() > uploadProperties.getMaxProfileImageSizeBytes())
            throw new InvalidImageException("Maximum profile photo size is 5 MB.");
        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        if (!StringUtils.hasText(extension)) throw new InvalidImageException("The image filename must have an extension.");
        extension = extension.toLowerCase(Locale.ROOT);
        String expectedType = ALLOWED_PROFILE_IMAGES.get(extension);
        if (expectedType == null || !expectedType.equalsIgnoreCase(file.getContentType()))
            throw new InvalidImageException("Unsupported image format or mismatched filename extension.");
        try (InputStream input = file.getInputStream()) {
            if ("webp".equals(extension)) {
                if (!isWebP(input)) throw new InvalidImageException("The uploaded file is not a valid image.");
            } else {
                BufferedImage image = ImageIO.read(input);
                if (image == null || image.getWidth() <= 0 || image.getHeight() <= 0)
                    throw new InvalidImageException("The uploaded file is not a valid image.");
            }
        } catch (IOException ex) {
            throw new InvalidImageException("The uploaded image is corrupted or unreadable.");
        }
        return extension;
    }

    private boolean isWebP(InputStream input) throws IOException {
        byte[] header = input.readNBytes(12);
        if (header.length < 12) return false;
        return header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F'
                && header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P';
    }
}
