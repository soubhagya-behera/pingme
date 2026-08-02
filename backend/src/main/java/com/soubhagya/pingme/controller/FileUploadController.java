package com.soubhagya.pingme.controller;

import com.soubhagya.pingme.dto.response.AttachmentUploadResponse;
import com.soubhagya.pingme.service.AttachmentStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileUploadController {
    private final AttachmentStorageService attachmentStorageService;

    @PostMapping("/file")
    public ResponseEntity<AttachmentUploadResponse> upload(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(attachmentStorageService.upload(file));
    }
}
