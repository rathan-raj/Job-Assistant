package com.rathanraj.jobassistant.dto;

import com.rathanraj.jobassistant.model.JobApplication.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

// ─── Request DTOs ────────────────────────────────────────────────────────────

public class JobApplicationDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        @NotBlank(message = "Company name is required")
        private String companyName;

        @NotBlank(message = "Job title is required")
        private String jobTitle;

        private String jobDescription;
        private String resumeSnapshot;
        private String jobUrl;
        private String location;
        private String notes;
        private ApplicationStatus status;  // defaults to SAVED if null
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateStatusRequest {
        private ApplicationStatus status;
        private String notes;
    }

    // ─── Response DTO ─────────────────────────────────────────────────────────

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private String companyName;
        private String jobTitle;
        private String jobUrl;
        private String location;
        private ApplicationStatus status;
        private Double matchScore;
        private String missingKeywords;
        private String resumeSuggestions;
        private String notes;
        private LocalDateTime appliedAt;
        private LocalDateTime updatedAt;
    }

    // ─── Resume Analyze Request ───────────────────────────────────────────────

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnalyzeRequest {
        @NotBlank(message = "Job description is required")
        private String jobDescription;

        @NotBlank(message = "Resume text is required")
        private String resumeText;
    }

    // ─── Analyze Response (stub until Phase 2 NLP service) ───────────────────

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AnalyzeResponse {
        private Double matchScore;
        private String missingKeywords;
        private String suggestions;
        private String message;   // "NLP service not connected yet" in Phase 1
    }
}
