package com.droplite.controller;

import com.droplite.exception.FileStorageException;
import com.droplite.model.FileEntity;
import com.droplite.service.FileStorageService;
import com.droplite.util.FileValidator;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    /**
     * Handles file upload with validation
     * @param file The file to be uploaded
     * @return ResponseEntity containing the saved file metadata
     * @throws FileStorageException if file validation fails
     */
    @PostMapping("/upload")
    public ResponseEntity<FileEntity> uploadFile(@RequestParam("file") MultipartFile file) {
        // Validate file type against allowed extensions
        if (!FileValidator.isValidFileType(file)) {
            throw new FileStorageException("File type not allowed. Allowed types: " + 
                String.join(", ", FileValidator.getAllowedExtensions()));
        }

        // Check if file size is within limits
        if (!FileValidator.isValidFileSize(file)) {
            throw new FileStorageException("File size exceeds the maximum limit (10MB)");
        }

        try {
            FileEntity fileEntity = fileStorageService.store(file);
            
            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/files/download/")
                    .path(fileEntity.getId().toString())
                    .toUriString();
            
            fileEntity.setPath(fileDownloadUri);
            
            return ResponseEntity.ok(fileEntity);
        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + file.getOriginalFilename() + ". Please try again!", ex);
        }
    }

    @GetMapping
    public ResponseEntity<List<FileEntity>> getAllFiles() {
        List<FileEntity> files = fileStorageService.getAllFiles();
        return ResponseEntity.ok(files);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id, HttpServletResponse response) {
        Resource resource = fileStorageService.loadAsResource(id);
        
        String contentType = "application/octet-stream";
        String headerValue = "attachment; filename=\"" + resource.getFilename() + "\"";
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, headerValue)
                .body(resource);
    }

    /**
     * Serves file content with appropriate content type for inline viewing
     * @param id The ID of the file to view
     * @return ResponseEntity containing the file resource with proper headers
     */
    @GetMapping("/view/{id}")
    public ResponseEntity<Resource> viewFile(@PathVariable Long id) {
        // Retrieve file metadata and content
        FileEntity fileEntity = fileStorageService.getFileById(id);
        Resource resource = fileStorageService.loadFileContent(id);
        
        // Initialize content type from file metadata
        String contentType = fileEntity.getContentType();
        String filename = fileEntity.getFilename().toLowerCase();
        
        // Override content types for text-based formats to ensure proper browser rendering
        // and set charset to UTF-8 for proper character encoding
        if (filename.endsWith(".txt")) {
            contentType = "text/plain; charset=utf-8";
        } else if (filename.endsWith(".json")) {
            contentType = "application/json; charset=utf-8";
        } else if (filename.endsWith(".csv")) {
            contentType = "text/csv; charset=utf-8";
        } else if (filename.endsWith(".xml")) {
            contentType = "application/xml; charset=utf-8";
        } else if (filename.endsWith(".html")) {
            contentType = "text/html; charset=utf-8";
        } else if (filename.endsWith(".css")) {
            contentType = "text/css; charset=utf-8";
        } else if (filename.endsWith(".js")) {
            contentType = "application/javascript; charset=utf-8";
        }
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.set("Content-Disposition", "inline; filename=\"" + fileEntity.getOriginalFilename() + "\"");
        
        // CORS headers for cross-origin embedding
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
        headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        return new ResponseEntity<>(resource, headers, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id) {
        fileStorageService.deleteFile(id);
        return ResponseEntity.noContent().build();
    }
}
