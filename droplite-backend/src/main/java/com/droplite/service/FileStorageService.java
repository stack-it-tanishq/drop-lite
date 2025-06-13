package com.droplite.service;

import com.droplite.model.FileEntity;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface FileStorageService {
    FileEntity store(MultipartFile file) throws IOException;
    Resource loadAsResource(Long id);
    List<FileEntity> getAllFiles();
    Resource loadFileContent(Long id);
    void deleteFile(Long id);
    FileEntity getFileById(Long id);
}
