package com.soubhagya.pingme.service;

import com.soubhagya.pingme.dto.response.AttachmentUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface AttachmentStorageService {
    AttachmentUploadResponse upload(MultipartFile file);

    boolean isManagedAttachment(String attachmentUrl);

    boolean isManagedAttachment(String attachmentUrl, Long attachmentSize, String attachmentMimeType);
}
