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
        String url = "http://localhost:8000/api/analyze";

        try {
            log.info("Calling NLP service at {}", url);
            Map<String, String> payload = Map.of(
                    "jd_text", jobDescription != null ? jobDescription : "",
                    "resume_text", resumeText != null ? resumeText : "");

            @SuppressWarnings("unchecked")
            Map<String, Object> result = restTemplate.postForObject(
                    url, payload, Map.class);

            String missingStr = null;
            if (result != null && result.get("missing_keywords") != null) {
                @SuppressWarnings("unchecked")
                java.util.List<String> missing = (java.util.List<String>) result.get("missing_keywords");
                missingStr = String.join(", ", missing);
            }

            return AnalyzeResponse.builder()
                    .matchScore(result != null ? (Double) result.get("match_score") : null)
                    .missingKeywords(missingStr)
                    .suggestions(result != null ? (String) result.get("suggested_improvements") : null)
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
