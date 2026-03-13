from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import spacy
import os
import json

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Job Assistant AI Engine")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For phase 3 dev, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load spaCy model for extracting relevant keywords (nouns, proper nouns, etc.)
# Fallback to downloading it if not present
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Downloading spaCy model 'en_core_web_sm'...")
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

class AnalysisRequest(BaseModel):
    resume_text: str
    jd_text: str

class AnalysisResponse(BaseModel):
    match_score: float
    missing_keywords: list[str]
    suggested_improvements: str

def extract_keywords(text: str) -> str:
    """Extracts meaningful keywords (nouns, proper nouns) from text using spaCy."""
    doc = nlp(text)
    keywords = set()
    for token in doc:
        if not token.is_stop and not token.is_punct and token.pos_ in ["NOUN", "PROPN"]:
            keywords.add(token.lemma_.lower())
    return " ".join(keywords)

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_resume_jd(request: AnalysisRequest):
    if not request.resume_text or not request.jd_text:
        raise HTTPException(status_code=400, detail="Both resume_text and jd_text must be provided")

    # 1. Process text to extract meaningful keywords
    resume_keywords_str = extract_keywords(request.resume_text)
    jd_keywords_str = extract_keywords(request.jd_text)
    
    # Use sets to easily find missing keywords
    resume_words_set = set(resume_keywords_str.split())
    jd_words_set = set(jd_keywords_str.split())
    
    # Missing keywords are those in the JD but not in the resume
    missing_keywords = list(jd_words_set - resume_words_set)
    # Sort them or prioritize them (here we just use arbitrary order for now)
    missing_keywords.sort()
    
    # 2. Compute Cosine Similarity using TF-IDF on the extracted keywords
    vectorizer = TfidfVectorizer()
    try:
        # Fit-transform fits the vectorizer and transforms the document into a document-term matrix
        tfidf_matrix = vectorizer.fit_transform([resume_keywords_str, jd_keywords_str])
        
        # Calculate cosine similarity between the two vectors
        cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        match_score = cosine_sim[0][0]
    except ValueError:
        # Happens if vocab is empty (e.g. no valid keywords found)
        match_score = 0.0

    match_score_percentage = round(float(match_score) * 100, 2)
    top_missing = missing_keywords[:15]
    
    improvements = ""
    if top_missing:
        improvements = f"Consider adding the following keywords to improve your match score: {', '.join(top_missing)}"
    else:
        improvements = "Great job! Your resume covers most of the key terms in the job description."

    return AnalysisResponse(
        match_score=match_score_percentage,
        missing_keywords=top_missing,
        suggested_improvements=improvements
    )

@app.get("/health")
def health_check():
    return {"status": "healthy"}

from fastapi.responses import RedirectResponse

@app.get("/")
def read_root():
    # Redirect root to the automatic interactive API documentation
    return RedirectResponse(url="/docs")

@app.get("/favicon.ico")
def favicon():
    # Return a dummy response for favicon to avoid 404s in the browser
    return {"status": "no icon"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
