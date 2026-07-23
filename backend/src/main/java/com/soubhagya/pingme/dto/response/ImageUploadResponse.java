package com.soubhagya.pingme.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ImageUploadResponse {

    private String imageUrl;

}