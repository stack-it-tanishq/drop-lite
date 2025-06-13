package com.droplite.util;

import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

public class FileValidator {
    
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "txt", "jpg", "jpeg", "png", "json"
    );
    
    public static List<String> getAllowedExtensions() {
        return List.copyOf(ALLOWED_EXTENSIONS);
    }
    
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    
    public static boolean isValidFileType(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            System.err.println("File is null or empty");
            return false;
        }
        
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            System.err.println("Original filename is null or empty");
            return false;
        }
        
        String extension = getFileExtension(originalFilename);
        boolean isValid = ALLOWED_EXTENSIONS.contains(extension.toLowerCase());
        
        if (!isValid) {
            System.err.println("File extension not allowed: " + extension);
            System.err.println("Allowed extensions: " + ALLOWED_EXTENSIONS);
        }
        
        return isValid;
    }
    
    public static boolean isValidFileSize(MultipartFile file) {
        if (file == null) {
            System.err.println("File is null");
            return false;
        }
        
        long fileSize = file.getSize();
        boolean isValid = fileSize <= MAX_FILE_SIZE;
        
        if (!isValid) {
            System.err.println("File size " + fileSize + " exceeds maximum allowed size " + MAX_FILE_SIZE);
        }
        
        return isValid;
    }
    
    private static String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }
}
