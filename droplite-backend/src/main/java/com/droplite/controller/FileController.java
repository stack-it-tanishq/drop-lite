package com.droplite.controller;

import com.droplite.exception.FileStorageException;
import com.droplite.exception.ResourceNotFoundException;
import com.droplite.model.FileEntity;
import com.droplite.service.FileStorageService;
import com.droplite.util.FileValidator;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/upload")
    public ResponseEntity<FileEntity> uploadFile(@RequestParam("file") MultipartFile file) {
        // Validate file type
        if (!FileValidator.isValidFileType(file)) {
            throw new FileStorageException("File type not allowed. Allowed types: " + 
                String.join(", ", FileValidator.getAllowedExtensions()));
        }

        // Validate file size
        if (!FileValidator.isValidFileSize(file)) {
            throw new FileStorageException("File size exceeds the maximum limit (10MB)");
        }

        try {
            FileEntity fileEntity = fileStorageService.store(file);
            
            // Generate download URL
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

    @GetMapping("/view/{id}")
    public ResponseEntity<Resource> viewFile(@PathVariable Long id) {
        Resource resource = fileStorageService.loadFileContent(id);
        
        // Determine content type
        String contentType = "application/octet-stream";
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id) {
        fileStorageService.deleteFile(id);
        return ResponseEntity.noContent().build();
    }
}
