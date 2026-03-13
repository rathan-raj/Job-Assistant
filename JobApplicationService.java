package com.rathanraj.jobassistant.service;

import com.rathanraj.jobassistant.dto.JobApplicationDTO;
import com.rathanraj.jobassistant.dto.JobApplicationDTO.*;
import com.rathanraj.jobassistant.model.JobApplication;
import com.rathanraj.jobassistant.model.JobApplication.ApplicationStatus;
import com.rathanraj.jobassistant.repository.JobApplicationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class JobApplicationService {

    private final JobApplicationRepository repository;
    private final NlpClientService nlpClientService; // Phase 2 stub

    // ─── Create ───────────────────────────────────────────────────────────────

    public Response createApplication(CreateRequest request) {
        log.info("Creating job application for {} at {}", request.getJobTitle(), request.getCompanyName());

        JobApplication application = JobApplication.builder()
                .companyName(request.getCompanyName())
                .jobTitle(request.getJobTitle())
                .jobDescription(request.getJobDescription())
                .resumeSnapshot(request.getResumeSnapshot())
                .jobUrl(request.getJobUrl())
                .location(request.getLocation())
                .notes(request.getNotes())
                .status(request.getStatus() != null ? request.getStatus() : ApplicationStatus.SAVED)
                .build();

        // If both JD and resume are provided, call NLP service (Phase 2)
        if (request.getJobDescription() != null && request.getResumeSnapshot() != null) {
            enrichWithNlpAnalysis(application, request.getJobDescription(), request.getResumeSnapshot());
        }

        JobApplication saved = repository.save(application);
        log.info("Saved application with id={}", saved.getId());
        return toResponse(saved);
    }

    // ─── Read ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<Response> getAllApplications() {
        return repository.findAllOrderByAppliedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Response getApplicationById(Long id) {
        return repository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Application not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Response> getApplicationsByStatus(ApplicationStatus status) {
        return repository.findByStatusOrderByAppliedAtDesc(status)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Response> searchApplications(String query) {
        return repository.findByCompanyNameContainingIgnoreCaseOrJobTitleContainingIgnoreCase(query, query)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ─── Update ───────────────────────────────────────────────────────────────

    public Response updateStatus(Long id, UpdateStatusRequest request) {
        JobApplication application = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Application not found with id: " + id));

        if (request.getStatus() != null) {
            log.info("Updating status for id={} to {}", id, request.getStatus());
            application.setStatus(request.getStatus());
        }
        if (request.getNotes() != null) {
            application.setNotes(request.getNotes());
        }

        return toResponse(repository.save(application));
    }

    // ─── Delete ───────────────────────────────────────────────────────────────

    public void deleteApplication(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Application not found with id: " + id);
        }
        repository.deleteById(id);
        log.info("Deleted application id={}", id);
    }

    // ─── Resume Analyze (delegates to NLP service) ───────────────────────────

    public AnalyzeResponse analyzeResumeVsJd(AnalyzeRequest request) {
        return nlpClientService.analyze(request.getJobDescription(), request.getResumeText());
    }

    // ─── Dashboard Stats ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Map<String, Long> getStatusSummary() {
        return repository.countGroupedByStatus()
                .stream()
                .collect(Collectors.toMap(
                        row -> row[0].toString(),
                        row -> (Long) row[1]
                ));
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private void enrichWithNlpAnalysis(JobApplication app, String jd, String resume) {
        try {
            AnalyzeResponse analysis = nlpClientService.analyze(jd, resume);
            app.setMatchScore(analysis.getMatchScore());
            app.setMissingKeywords(analysis.getMissingKeywords());
            app.setResumeSuggestions(analysis.getSuggestions());
        } catch (Exception e) {
            log.warn("NLP service unavailable, skipping analysis: {}", e.getMessage());
        }
    }

    private Response toResponse(JobApplication app) {
        return Response.builder()
                .id(app.getId())
                .companyName(app.getCompanyName())
                .jobTitle(app.getJobTitle())
                .jobUrl(app.getJobUrl())
                .location(app.getLocation())
                .status(app.getStatus())
                .matchScore(app.getMatchScore())
                .missingKeywords(app.getMissingKeywords())
                .resumeSuggestions(app.getResumeSuggestions())
                .notes(app.getNotes())
                .appliedAt(app.getAppliedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }
}
