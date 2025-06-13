# DropLite

A simplified, lightweight file sharing web application built with React, Spring Boot, and PostgreSQL.

## Features

- 📁 Upload files with drag-and-drop
- 📱 Responsive design that works on all devices
- 🔍 Preview supported file types (images, text, JSON)
- ⚡ Fast file downloads
- 🔒 Secure file storage
- 🐳 Easy Docker-based deployment

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10.0 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0.0 or higher)
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/drop-lite.git
cd drop-lite
```

### 2. Start the application

Run the following command to start all services:

```bash
docker-compose up --build
```

This will start:
- Frontend on http://localhost:3000
- Backend API on http://localhost:8080
- PostgreSQL database
- (Optional) pgAdmin on http://localhost:5050

### 3. Access the application

Open your browser and navigate to:

```
http://localhost:3000
```

## Development

### Running in development mode

1. **Backend**:
   ```bash
   cd droplite-backend
   ./mvnw spring-boot:run
   ```

2. **Frontend**:
   ```bash
   cd droplite-frontend
   npm install
   npm start
   ```

### Environment Variables

#### Backend
- `SPRING_DATASOURCE_URL`: Database connection URL
- `SPRING_DATASOURCE_USERNAME`: Database username
- `SPRING_DATASOURCE_PASSWORD`: Database password
- `FILE_UPLOAD_DIR`: Directory to store uploaded files

#### Frontend
- `REACT_APP_API_URL`: URL of the backend API

## Project Structure

```
drop-lite/
├── droplite-backend/     # Spring Boot backend
├── droplite-frontend/    # React frontend
├── docker-compose.yml    # Docker Compose configuration
└── README.md            # This file
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For support, please open an issue on the GitHub repository.
