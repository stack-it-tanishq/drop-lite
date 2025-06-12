package com.droplite.service;

import com.droplite.exception.FileStorageException;
import com.droplite.exception.ResourceNotFoundException;
import com.droplite.model.FileEntity;
import com.droplite.repository.FileRepository;
import com.droplite.util.FileValidator;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final FileRepository fileRepository;
    private final Path fileStorageLocation;

    public FileStorageServiceImpl(FileRepository fileRepository) {
        this.fileRepository = fileRepository;
        this.fileStorageLocation = Paths.get("uploads")
                .toAbsolutePath().normalize();
        
        try {
            System.out.println("Creating upload directory: " + this.fileStorageLocation);
            Files.createDirectories(this.fileStorageLocation);
            System.out.println("Upload directory exists: " + Files.exists(this.fileStorageLocation));
            System.out.println("Upload directory is writable: " + Files.isWritable(this.fileStorageLocation));
        } catch (Exception ex) {
            String errorMsg = "Could not create the directory where the uploaded files will be stored: " + 
                           this.fileStorageLocation + 
                           ". Error: " + ex.getMessage();
            System.err.println(errorMsg);
            throw new FileStorageException(errorMsg, ex);
        }
    }

    @Override
    public FileEntity store(MultipartFile file) throws IOException {
        // Log file info
        System.out.println("Processing file upload: " + file.getOriginalFilename());
        System.out.println("Content type: " + file.getContentType());
        System.out.println("File size: " + file.getSize());
        
        // Validate file
        if (!FileValidator.isValidFileType(file)) {
            String errorMsg = "File type not allowed: " + file.getContentType() + 
                           ". Allowed types: " + FileValidator.getAllowedExtensions();
            System.err.println(errorMsg);
            throw new FileStorageException(errorMsg);
        }

        // Normalize file name
        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String fileExtension = "";
        if (originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID() + fileExtension;

        try {
            // Check if the file's name contains invalid characters
            if (fileName.contains("..")) {
                String errorMsg = "Sorry! Filename contains invalid path sequence " + fileName;
                System.err.println(errorMsg);
                throw new FileStorageException(errorMsg);
            }

            System.out.println("Original filename: " + originalFileName);
            System.out.println("Generated filename: " + fileName);
            
            // Create target location
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            System.out.println("Target location: " + targetLocation);
            
            // Ensure parent directory exists
            Path parentDir = targetLocation.getParent();
            if (parentDir != null) {
                Files.createDirectories(parentDir);
            }

            // Copy file to the target location (Replacing existing file with the same name)
            System.out.println("Copying file to target location...");
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("File copied successfully");

            // Save file metadata to database
            System.out.println("Saving file metadata to database...");
            FileEntity fileEntity = new FileEntity();
            fileEntity.setFilename(fileName);
            fileEntity.setOriginalFilename(originalFileName);
            fileEntity.setPath(targetLocation.toString());
            fileEntity.setContentType(file.getContentType());
            fileEntity.setSize(file.getSize());

            FileEntity savedEntity = fileRepository.save(fileEntity);
            System.out.println("File metadata saved with ID: " + savedEntity.getId());
            
            return savedEntity;
        } catch (Exception ex) {
            String errorMsg = "Could not store file " + fileName + ". Error: " + ex.getMessage();
            System.err.println(errorMsg);
            ex.printStackTrace();
            throw new FileStorageException(errorMsg, ex);
        }
    }

    @Override
    public Resource loadAsResource(Long id) {
        FileEntity fileEntity = fileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with id " + id));

        try {
            Path filePath = Path.of(fileEntity.getPath());
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found " + fileEntity.getFilename());
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File not found " + fileEntity.getFilename(), ex);
        }
    }

    @Override
    public List<FileEntity> getAllFiles() {
        return fileRepository.findAll();
    }

    @Override
    public Resource loadFileContent(Long id) {
        // For text/plain, application/json, etc. we can return the content directly
        return loadAsResource(id);
    }

    @Override
    public void deleteFile(Long id) {
        FileEntity fileEntity = fileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with id " + id));
        
        try {
            // Delete file from filesystem
            Files.deleteIfExists(Path.of(fileEntity.getPath()));
            // Delete from database
            fileRepository.delete(fileEntity);
        } catch (IOException ex) {
            throw new FileStorageException("Could not delete file " + fileEntity.getFilename(), ex);
        }
    }
}
