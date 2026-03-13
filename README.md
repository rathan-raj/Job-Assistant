# 🚀 Job Assistant — Phase 1: Spring Boot Backend

AI-Powered Job Application Tracker — built by Rathan Raj Dasari

---

## Project Structure

```
src/main/java/com/rathanraj/jobassistant/
├── JobAssistantApplication.java      # Entry point
├── controller/
│   └── JobApplicationController.java # REST endpoints
├── service/
│   ├── JobApplicationService.java    # Business logic
│   └── NlpClientService.java         # Phase 2 NLP stub
├── repository/
│   └── JobApplicationRepository.java # JPA queries
├── model/
│   └── JobApplication.java           # Entity
├── dto/
│   └── JobApplicationDTO.java        # Request/Response DTOs
└── config/
    └── GlobalExceptionHandler.java   # Error handling
```

---

## Quick Start

### 1. Start PostgreSQL
```bash
docker-compose up -d postgres
```

### 2. Update credentials in `application.properties`
```
spring.datasource.password=your_password_here
```

### 3. Run the app
```bash
./mvnw spring-boot:run
```

### 4. Open Swagger UI
```
http://localhost:8080/swagger-ui.html
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/applications` | Create a new application |
| GET | `/api/v1/applications` | Get all (filter by ?status= or ?search=) |
| GET | `/api/v1/applications/{id}` | Get single application |
| PATCH | `/api/v1/applications/{id}/status` | Update status |
| DELETE | `/api/v1/applications/{id}` | Delete application |
| POST | `/api/v1/resume/analyze` | Analyze resume vs JD |
| GET | `/api/v1/dashboard/summary` | Status counts for dashboard |

### Application Statuses
`SAVED` → `APPLIED` → `SCREENING` → `INTERVIEW` → `OFFER` / `REJECTED` / `WITHDRAWN`

---

## Run Tests
```bash
./mvnw test
```

---
