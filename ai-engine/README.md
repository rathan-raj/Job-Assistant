# Job Assistant AI Engine

This is the Phase 2 AI/NLP microservice for the Job Assistant platform. It exposes a REST API powered by FastAPI that compares a job description with a resume to extract keywords and compute a match score.

## Features Built
- Keyword extraction from job descriptions and resumes using `spaCy`. (specifically extracts nouns and proper nouns)
- Compute a match score leveraging Cosine Similarity via TF-IDF `scikit-learn` algorithms.
- Identifies missing keywords from the user's resume and returns actionable recommendations to improve the match score.

## Tech Stack
- **Python 3**
- **FastAPI** & **Uvicorn**
- **scikit-learn**
- **spaCy**

## Setup Instructions

1. **Activate the Virtual Environment:**
   ```bash
   cd ai-engine
   source venv/bin/activate
   ```

2. **Run the Application:**
   ```bash
   python main.py
   ```
   The engine will start running on port `8000`.

## API Endpoints

### 1. Match Resume with Job Description

- **URL:** `/api/analyze`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "resume_text": "Experienced Java developer with REST APIs...",
    "jd_text": "Looking for a backend engineer with Python microservices..."
  }
  ```
- **Response:**
  ```json
  {
    "match_score": 23.79,
    "missing_keywords": ["engineer", "microservices", "python"],
    "suggested_improvements": "Consider adding the following keywords to improve your match score: engineer, microservices, python"
  }
  ```

### 2. Health Check

- **URL:** `/health`
- **Method:** `GET`
