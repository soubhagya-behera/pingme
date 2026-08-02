package com.soubhagya.pingme.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AttachmentUploadResponse {
    private final String attachmentUrl;
    private final String attachmentName;
    private final long attachmentSize;
    private final String attachmentMimeType;
}
