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
    private final UploadProperties uploadProperties;
    private Path uploadPath;

    @PostConstruct
    public void init() {
        try {
            uploadPath = Paths.get(uploadProperties.getImageDirectory()).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
        } catch (IOException ex) {
            throw new ImageStorageException("Could not initialize image storage.", ex);
        }
    }

    @Override
    public String upload(MultipartFile file) {
        String extension = validate(file);
        for (int attempt = 0; attempt < 3; attempt++) {
            String fileName = UUID.randomUUID() + "." + extension;
            Path target = uploadPath.resolve(fileName).normalize();
            if (!target.startsWith(uploadPath)) throw new InvalidImageException("Invalid image filename.");
            try (InputStream input = file.getInputStream()) {
                Files.copy(input, target);
                return "/uploads/chat-images/" + fileName;
            } catch (FileAlreadyExistsException ignored) {
                // UUID collisions are extraordinarily unlikely, but never overwrite an existing upload.
            } catch (IOException ex) {
                throw new ImageStorageException("Image upload failed.", ex);
            }
        }
        throw new ImageStorageException("Could not allocate an image filename.", null);
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
}
