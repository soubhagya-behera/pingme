package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.dto.response.ImageUploadResponse;
import com.soubhagya.pingme.payload.ApiResponse;
import com.soubhagya.pingme.service.ImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class ImageUploadController {

    private final ImageStorageService imageStorageService;

    @PostMapping("/image")
    public ResponseEntity<ApiResponse<ImageUploadResponse>> upload(

            @RequestParam("image")

            MultipartFile image

    ) {

        String url =

                imageStorageService.upload(image);

        return ResponseEntity.ok(

        ApiResponse.success(

                "Image uploaded successfully.",

                ImageUploadResponse.builder()

                        .imageUrl(url)

                        .build()

        )

);

    }

}