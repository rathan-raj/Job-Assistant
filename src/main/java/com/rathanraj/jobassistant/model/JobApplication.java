package com.rathanraj.jobassistant.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String companyName;

    @NotBlank
    @Column(nullable = false)
    private String jobTitle;

    @Column(columnDefinition = "TEXT")
    private String jobDescription;

    @Column(columnDefinition = "TEXT")
    private String resumeSnapshot;   // resume text used for this application

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;

    private String jobUrl;

    private String location;

    private String notes;

    // Populated by Phase 2 NLP service
    private Double matchScore;

    @Column(columnDefinition = "TEXT")
    private String missingKeywords;   // comma-separated keywords from JD not in resume

    @Column(columnDefinition = "TEXT")
    private String resumeSuggestions; // AI-generated suggestions from Phase 2

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime appliedAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum ApplicationStatus {
        SAVED,       // job saved, not yet applied
        APPLIED,     // applied, waiting for response
        SCREENING,   // phone/HR screen scheduled
        INTERVIEW,   // technical/behavioural interview
        OFFER,       // offer received
        REJECTED,    // rejected
        WITHDRAWN    // self-withdrawn
    }
}
