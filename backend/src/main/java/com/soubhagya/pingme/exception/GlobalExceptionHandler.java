package com.soubhagya.pingme.exception;

import com.soubhagya.pingme.payload.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.security.access.AccessDeniedException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<?>> handleAlreadyExists(ResourceAlreadyExistsException ex){

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        ApiResponse.builder()
                                .success(false)
                                .message(ex.getMessage())
                                .build()
                );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> validation(MethodArgumentNotValidException ex){

        String error = ex.getBindingResult()
                .getFieldError()
                .getDefaultMessage();

        return ResponseEntity.badRequest().body(

                ApiResponse.builder()
                        .success(false)
                        .message(error)
                        .build()

        );

    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<?>> illegalArgument(IllegalArgumentException ex) {

        return ResponseEntity.badRequest().body(

                ApiResponse.builder()
                        .success(false)
                        .message(ex.getMessage())
                        .build()

        );

    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<ApiResponse<?>> invalidToken(InvalidTokenException ex) {
        return ResponseEntity.badRequest().body(
                ApiResponse.failure("Activation link is invalid or expired.")
        );
    }

    @ExceptionHandler({InvalidImageException.class, InvalidAttachmentException.class, MissingServletRequestPartException.class})
    public ResponseEntity<ApiResponse<?>> invalidImage(Exception ex) {
        String message = ex instanceof MissingServletRequestPartException ? "Please select a file." : ex.getMessage();
        return ResponseEntity.badRequest().body(ApiResponse.failure(message));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<?>> uploadTooLarge(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ApiResponse.failure("Maximum attachment size is 10 MB."));
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ApiResponse<?>> multipart(MultipartException ex) {
        return ResponseEntity.badRequest().body(ApiResponse.failure("The file upload could not be processed."));
    }

    @ExceptionHandler(AttachmentStorageException.class)
    public ResponseEntity<ApiResponse<?>> attachmentStorage(AttachmentStorageException ex) {
        return ResponseEntity.internalServerError()
                .body(ApiResponse.failure("Attachment storage is temporarily unavailable. Please try again."));
    }

    @ExceptionHandler(ImageStorageException.class)
    public ResponseEntity<ApiResponse<?>> storage(ImageStorageException ex) {
        return ResponseEntity.internalServerError()
                .body(ApiResponse.failure("Image storage is temporarily unavailable. Please try again."));
    }

    @ExceptionHandler({SecurityException.class, AccessDeniedException.class})
    public ResponseEntity<ApiResponse<?>> forbidden(Exception ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.failure(ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> exception(Exception ex){

        return ResponseEntity.internalServerError().body(

                ApiResponse.builder()
                        .success(false)
                .message("An unexpected error occurred. Please try again.")
                        .build()

        );

    }

}
