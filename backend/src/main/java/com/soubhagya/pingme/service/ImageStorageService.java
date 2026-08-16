package com.soubhagya.pingme.service;

import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {

    String upload(MultipartFile file);

    boolean isManagedImage(String imageUrl);

    String uploadProfilePhoto(MultipartFile file);

    void delete(String imageUrl);

}
