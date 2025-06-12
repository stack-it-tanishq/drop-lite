# DropLite Backend

A Spring Boot application for the DropLite service.

## Prerequisites

- Java 17 or later
- Gradle 8.0 or later
- PostgreSQL (for production)
- H2 Database (for development, embedded)

## Getting Started

### Build the Application

```bash
./gradlew clean build
```

### Run the Application

```bash
./gradlew bootRun
```

The application will be available at `http://localhost:8080`.

### Run Tests

```bash
./gradlew test
```

### Build Without Tests

```bash
./gradlew clean build -x test
```

## Project Structure

- `src/main/java` - Main application code
- `src/test/java` - Test code
- `src/main/resources` - Configuration files and static resources

## Configuration

Application properties can be configured in `src/main/resources/application.properties` or by using environment variables.

## Dependencies

- Spring Boot 3.2.0
- Spring Data JPA
- Spring Security
- JWT for authentication
- PostgreSQL/H2 Database
- Lombok for reducing boilerplate code

## Building for Production

To create a production-ready JAR file:

```bash
./gradlew clean bootJar
```

The JAR file will be created at `build/libs/droplite-backend.jar`.

## Running in Production

```bash
java -jar build/libs/droplite-backend.jar
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
