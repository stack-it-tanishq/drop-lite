package com.droplite.service;

import com.droplite.model.FileEntity;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Service interface for file storage operations.
 * Defines the contract for storing, retrieving, and managing files in the system.
 */
public interface FileStorageService {
    
    /**
     * Stores a file in the filesystem and saves its metadata to the database.
     *
     * @param file The file to be stored
     * @return The saved file entity with generated ID and metadata
     * @throws IOException If an I/O error occurs during file storage
     * @throws FileStorageException If the file is invalid or storage fails
     */
    FileEntity store(MultipartFile file) throws IOException;
    
    /**
     * Loads a file as a Spring Resource for download.
     *
     * @param id The ID of the file to load
     * @return The file as a Resource
     * @throws ResourceNotFoundException If the file is not found
     */
    Resource loadAsResource(Long id);
    
    /**
     * Retrieves metadata for all files in the system.
     *
     * @return List of all file entities
     */
    List<FileEntity> getAllFiles();
    
    /**
     * Loads file content for viewing in the browser.
     *
     * @param id The ID of the file to view
     * @return The file content as a Resource with appropriate content type
     */
    Resource loadFileContent(Long id);
    
    /**
     * Deletes a file from both the filesystem and database.
     *
     * @param id The ID of the file to delete
     * @throws ResourceNotFoundException If the file is not found
     * @throws FileStorageException If the file cannot be deleted
     */
    void deleteFile(Long id);
    
    /**
     * Retrieves file metadata by ID.
     *
     * @param id The ID of the file to retrieve
     * @return The file entity
     * @throws ResourceNotFoundException If the file is not found
     */
    FileEntity getFileById(Long id);
}
