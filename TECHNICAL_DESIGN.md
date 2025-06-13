# DropLite - Technical Design Document

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │────▶│     Backend     │◀───▶│   PostgreSQL    │
│  (React/TS)     │     │   (Spring Boot)  │     │   Database      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                                
```

### 1.2 Container Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Docker Host                               │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     │
│  │  Frontend   │     │   Backend    │     │  PostgreSQL  │     │
│  │  (Nginx)    │     │ (Spring Boot)│     │             │     │
│  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘     │
│         │                    │                    │            │
│         └────────────────────┼────────────────────┘            │
│                              │                                 │
└──────────────────────────────┼─────────────────────────────────┘
                               ▼
                     ┌─────────────────┐
                     │  Host Network   │
                     └─────────────────┘
```

## 2. Component Design

### 2.1 Frontend Components

```typescript
// Component Hierarchy
App
├── FileUpload
├── FileList
│   └── FileItem
├── FilePreviewModal
└── Notification
```

### 2.2 Backend Modules

```
com.droplite
├── config/         # Configuration classes
├── controller/     # REST endpoints
├── model/          # Data models
├── repository/     # Data access layer
├── service/        # Business logic
└── util/           # Utility classes
```

## 3. Data Model

### 3.1 Database Schema

```sql
CREATE TABLE files (
    id BIGSERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    path VARCHAR(512) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 File Storage

- **Location**: `/app/uploads` (inside container)
- **Naming**: UUID + original extension
- **Permissions**: 644 (rw-r--r--)

## 4. API Specifications

### 4.1 REST Endpoints

```
GET    /api/files           - List all files
GET    /api/files/{id}      - Get file metadata
GET    /api/files/{id}/view - View file in browser
GET    /api/files/{id}/download - Download file
POST   /api/files/upload    - Upload new file
DELETE /api/files/{id}      - Delete file
```

### 4.2 Request/Response Examples

**Upload File**
```http
POST /api/files/upload
Content-Type: multipart/form-data

-- boundary
Content-Disposition: form-data; name="file"; filename="example.txt"
Content-Type: text/plain

[file content]
```

**Response**
```json
{
  "id": 1,
  "filename": "a1b2c3d4-e5f6-7890.txt",
  "originalFilename": "example.txt",
  "contentType": "text/plain",
  "size": 1234,
  "createdAt": "2025-06-13T10:15:30Z"
}
```

## 5. Security Design

### 5.1 Authentication (Future)

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

### 5.2 File Upload Security

- File type validation
- Size limits (10MB)
- Virus scanning (clamav integration)
- Content-Disposition headers
- CORS configuration

## 6. Performance Considerations

### 6.1 Frontend

- Code splitting with React.lazy
- Image optimization
- Caching strategies
- Lazy loading components

### 6.2 Backend

- Connection pooling (HikariCP)
- File streaming for large files
- Async processing for uploads
- Caching (Redis for future)

## 7. Error Handling

### 7.1 HTTP Status Codes

- 200 OK - Success
- 201 Created - Resource created
- 400 Bad Request - Invalid input
- 401 Unauthorized - Authentication required
- 403 Forbidden - Insufficient permissions
- 404 Not Found - Resource not found
- 413 Payload Too Large - File too big
- 415 Unsupported Media Type - Invalid file type
- 500 Internal Server Error - Server error

### 7.2 Error Response Format

```json
{
  "timestamp": "2025-06-13T10:20:30Z",
  "status": 400,
  "error": "Bad Request",
  "message": "File size exceeds maximum limit",
  "path": "/api/files/upload"
}
```

## 8. Deployment Architecture

### 8.1 Development

```yaml
# docker-compose.dev.yml
services:
  frontend:
    build: ./droplite-frontend
    ports: ["3000:80"]
    volumes:
      - ./droplite-frontend:/app
      - /app/node_modules
    
  backend:
    build: ./droplite-backend
    ports: ["8080:8080"]
    volumes:
      - ./droplite-backend:/app
      - ~/.m2:/root/.m2
    depends_on:
      - postgres
    
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: droplite
      POSTGRES_USER: droplite
      POSTGRES_PASSWORD: droplite_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### 8.2 Production

- **Frontend**: CDN + Nginx
- **Backend**: Load balanced Spring Boot instances
- **Database**: Managed PostgreSQL (AWS RDS/Google Cloud SQL)
- **Storage**: Object storage (S3/Google Cloud Storage)
- **CI/CD**: GitHub Actions/GitLab CI

## 9. Monitoring and Logging

### 9.1 Metrics Collection

- Prometheus for metrics
- Grafana for visualization
- ELK Stack for logs

### 9.2 Health Checks

```yaml
# application.yml
management:
  endpoint:
    health:
      show-details: always
  endpoints:
    web:
      exposure:
        include: health,info,metrics
```

## 10. Future Enhancements

### 10.1 Short-term

- [ ] User authentication
- [ ] File sharing with expiration
- [ ] File preview for more formats
- [ ] Bulk operations

### 10.2 Long-term

- [ ] Real-time updates with WebSocket
- [ ] Integration with cloud storage providers
- [ ] Advanced search functionality
- [ ] Mobile applications

## 11. Dependencies

### 11.1 Frontend

- React 18
- TypeScript 5
- Material-UI 5
- Axios 1.6
- React-Dropzone 14

### 11.2 Backend

- Spring Boot 3.1
- Spring Web
- Spring Data JPA
- PostgreSQL Driver
- Lombok
- MapStruct
- SpringDoc OpenAPI

## 12. Performance Metrics

| Metric                     | Target     |
|---------------------------|------------|
| API Response Time (p95)   | < 500ms    |
| File Upload (10MB)        | < 5s       |
| Concurrent Users          | 1000+      |
| Uptime                    | 99.9%      |
| Database Query Time (p95) | < 100ms    |


## 13. Security Controls

- Input validation
- CSRF protection
- XSS prevention
- SQL injection prevention
- Secure headers
- Rate limiting
- Audit logging

## 14. Compliance

- GDPR compliance for user data
- Data retention policies
- Regular security audits
- Penetration testing
