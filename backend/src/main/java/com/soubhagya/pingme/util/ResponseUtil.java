package com.soubhagya.pingme.util;

import com.soubhagya.pingme.payload.ApiResponse;

public class ResponseUtil {

    private ResponseUtil(){}

    public static <T> ApiResponse<T> success(String message,T data){

        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();

    }

}