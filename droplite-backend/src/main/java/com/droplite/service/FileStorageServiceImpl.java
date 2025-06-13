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

/**
 * Implementation of {@link FileStorageService} that stores files on the local filesystem
 * and maintains file metadata in a database.
 * 
 * <p>Files are stored with UUID-based filenames to prevent naming conflicts, while
 * the original filenames are preserved in the database for user reference.</p>
 */
@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final FileRepository fileRepository;
    // Base directory where uploaded files are stored
    private final Path fileStorageLocation;

    /**
     * Initializes the file storage service and ensures the upload directory exists.
     *
     * @param fileRepository The repository for file metadata operations
     * @throws FileStorageException if the upload directory cannot be created
     */
    public FileStorageServiceImpl(FileRepository fileRepository) {
        this.fileRepository = fileRepository;
        // Initialize the base directory for file storage
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        
        try {
            // Create the upload directory if it doesn't exist
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
        // Log file information for debugging
        System.out.println("Processing file upload: " + file.getOriginalFilename());
        System.out.println("Content type: " + file.getContentType());
        System.out.println("File size: " + file.getSize());
        
        // Note: In production, consider using a proper logging framework (e.g., SLF4J)
        // instead of System.out.println
        
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
        // Retrieve file metadata from database
        FileEntity fileEntity = fileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with id " + id));

        try {
            // Convert stored path to a Path object
            Path filePath = Path.of(fileEntity.getPath());
            // Create a URL resource for the file
            Resource resource = new UrlResource(filePath.toUri());
            
            // Verify the file exists and is readable
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                // File exists in DB but not on filesystem - log and throw
                System.err.println("File exists in database but not on filesystem: " + fileEntity.getPath());
                throw new ResourceNotFoundException("File not found " + fileEntity.getFilename());
            }
        } catch (MalformedURLException ex) {
            // Handle invalid file path format
            throw new ResourceNotFoundException("Invalid file path " + fileEntity.getFilename(), ex);
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
        // First check if file exists in database
        FileEntity fileEntity = fileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with id " + id));
        
        try {
            // Delete the physical file from storage
            Path filePath = Path.of(fileEntity.getPath());
            boolean fileDeleted = Files.deleteIfExists(filePath);
            
            if (!fileDeleted) {
                System.err.println("File not found on filesystem during deletion: " + filePath);
                // Continue with DB deletion to maintain consistency
            }
            
            // Delete the file metadata from database
            fileRepository.delete(fileEntity);
            
        } catch (IOException ex) {
            // Log the error and wrap in a more specific exception
            String errorMsg = String.format("Failed to delete file %s (ID: %d): %s", 
                fileEntity.getFilename(), id, ex.getMessage());
            System.err.println(errorMsg);
            throw new FileStorageException(errorMsg, ex);
        }
    }
    
    @Override
    public FileEntity getFileById(Long id) {
        return fileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with id " + id));
    }
}
