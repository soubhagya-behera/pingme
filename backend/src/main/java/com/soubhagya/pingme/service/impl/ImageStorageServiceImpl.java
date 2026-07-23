package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.config.UploadProperties;
import com.soubhagya.pingme.service.ImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageStorageServiceImpl implements ImageStorageService {

    private final UploadProperties uploadProperties;

    private Path uploadPath;

    private static final List<String> ALLOWED_TYPES = List.of(

            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"

    );

    private static final long MAX_FILE_SIZE =

            10 * 1024 * 1024;

    @PostConstruct
    public void init() {

        try {

            uploadPath = Paths.get(

                    uploadProperties.getImageDirectory()

            ).toAbsolutePath().normalize();

            System.out.println("Upload Path : " + uploadPath);

            Files.createDirectories(uploadPath);

        } catch (IOException e) {

            throw new RuntimeException(

                    "Could not create upload directory.",

                    e

            );

        }

    }

    @Override
    public String upload(MultipartFile file) {

        validate(file);

        String extension =

                StringUtils.getFilenameExtension(

                        file.getOriginalFilename()

                );

        String fileName =

                UUID.randomUUID()

                        + "." +

                        extension;

        try {

            Path target =

                    uploadPath.resolve(fileName);

            Files.copy(

                    file.getInputStream(),

                    target,

                    StandardCopyOption.REPLACE_EXISTING

            );

            return "/uploads/chat-images/" + fileName;

        } catch (IOException e) {

            throw new RuntimeException(

                    "Image upload failed.",

                    e

            );

        }

    }

    private void validate(MultipartFile file) {

        if (file == null || file.isEmpty()) {

            throw new RuntimeException(

                    "Please select an image."

            );

        }

        if (

                file.getSize()

                        >

                        MAX_FILE_SIZE

        ) {

            throw new RuntimeException(

                    "Maximum image size is 10 MB."

            );

        }

        if (

                !ALLOWED_TYPES.contains(

                        file.getContentType()

                )

        ) {

            throw new RuntimeException(

                    "Unsupported image format."

            );

        }

    }

}