package com.rathanraj.jobassistant.service;

import com.rathanraj.jobassistant.dto.JobApplicationDTO.AnalyzeResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Stub client for the Python NLP microservice (Phase 2).
 * In Phase 1 it returns a placeholder response.
 * In Phase 2 this will make an HTTP call to the FastAPI NLP service.
 */
@Service
@Slf4j
public class NlpClientService {

    @Value("${nlp.service.url:}")
    private String nlpServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public AnalyzeResponse analyze(String jobDescription, String resumeText) {
        if (nlpServiceUrl == null || nlpServiceUrl.isBlank()) {
            log.info("NLP service URL not configured — returning stub response");
            return AnalyzeResponse.builder()
                    .matchScore(null)
                    .missingKeywords(null)
                    .suggestions(null)
                    .message("NLP analysis not available yet. Phase 2 Python service not connected.")
                    .build();
        }

        try {
            log.info("Calling NLP service at {}", nlpServiceUrl);
            Map<String, String> payload = Map.of(
                    "job_description", jobDescription,
                    "resume_text", resumeText
            );

            // Phase 2: this will return matchScore, missingKeywords, suggestions
            @SuppressWarnings("unchecked")
            Map<String, Object> result = restTemplate.postForObject(
                    nlpServiceUrl + "/analyze", payload, Map.class);

            return AnalyzeResponse.builder()
                    .matchScore(result != null ? (Double) result.get("match_score") : null)
                    .missingKeywords(result != null ? (String) result.get("missing_keywords") : null)
                    .suggestions(result != null ? (String) result.get("suggestions") : null)
                    .message("Analysis complete")
                    .build();

        } catch (Exception e) {
            log.error("Failed to call NLP service: {}", e.getMessage());
            return AnalyzeResponse.builder()
                    .message("NLP service temporarily unavailable: " + e.getMessage())
                    .build();
        }
    }
}
