# 🚀 Job Assistant — Full Stack Application
AI-Powered Job Application Tracker — built by Rathan Raj Dasari

---

## 🏗️ Architecture (Phase 4 Completed)

This project has been fully built out into a standard Microservices-based Full Stack app consisting of:
1. **Frontend**: React (Vite) + Lucide Icons + Recharts
2. **Backend**: Spring Boot 3 (Java 25) REST API
3. **AI Engine**: Python FastAPI microservice (Scikit-Learn, spaCy)
4. **Database**: PostgreSQL Native Database 
5. **Orchestration**: Docker Compose + GitHub Actions CI/CD Pipeline

---

## ⚡ Quick Start (Dockerized)

The easiest way to boot the entire stack natively is using our newly integrated `docker-compose` configuration:

```bash
# 1. Boot up the entire architecture
docker-compose up --build -d

# 2. Access the Application!
# Frontend Dashboard: http://localhost:5173
# Spring Boot API: http://localhost:8080/swagger-ui.html
# AI Engine API: http://localhost:8000/docs
```

---

## ⚡ Quick Start (Manual Developer Mode)

### 1. Start PostgreSQL
```bash
docker-compose up -d db
```

### 2. Run the Java Backend
```bash
# Update credentials in src/main/resources/application.properties first
./mvnw spring-boot:run
```

### 3. Run the Python AI Engine
```bash
cd ai-engine
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 4. Run the React Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 API Endpoints (Spring Boot)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/applications` | Create a new application (triggers AI analysis) |
| GET | `/api/v1/applications` | Get all applications |
| GET | `/api/v1/applications/{id}` | Get single application |
| PATCH | `/api/v1/applications/{id}/status` | Update application status |
| DELETE | `/api/v1/applications/{id}` | Delete application |
| POST | `/api/v1/resume/analyze` | Direct pass-through to Python AI |

---

## 🤖 AI Engine Endpoints (FastAPI)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Calculates Match Score %, identifies missing keywords, and parses dynamic suggestions! |
| GET | `/health` | Health Check Ping |

---

## ⚙️ CI/CD Pipeline
A GitHub Actions workflow is located at `.github/workflows/deploy.yml` which automatically:
- Builds, Lints, and runs tests for Spring Boot App
- Provisions Python SpaCy and dependencies, runs static analysis
- Builds the React UI into minimized dist static files
- Verifies Docker Compose compilation validation

---
