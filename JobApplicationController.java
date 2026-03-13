package com.rathanraj.jobassistant.controller;

import com.rathanraj.jobassistant.dto.JobApplicationDTO;
import com.rathanraj.jobassistant.dto.JobApplicationDTO.*;
import com.rathanraj.jobassistant.model.JobApplication.ApplicationStatus;
import com.rathanraj.jobassistant.service.JobApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")  // Allow React frontend in Phase 3
@Tag(name = "Job Applications", description = "Manage and track job applications")
public class JobApplicationController {

    private final JobApplicationService service;

    // ─── CREATE ──────────────────────────────────────────────────────────────

    @PostMapping("/applications")
    @Operation(summary = "Save a new job application")
    public ResponseEntity<Response> create(@Valid @RequestBody CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createApplication(request));
    }

    // ─── READ ─────────────────────────────────────────────────────────────────

    @GetMapping("/applications")
    @Operation(summary = "Get all applications, optionally filtered by status")
    public ResponseEntity<List<Response>> getAll(
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) String search) {

        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(service.searchApplications(search));
        }
        if (status != null) {
            return ResponseEntity.ok(service.getApplicationsByStatus(status));
        }
        return ResponseEntity.ok(service.getAllApplications());
    }

    @GetMapping("/applications/{id}")
    @Operation(summary = "Get a single application by ID")
    public ResponseEntity<Response> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getApplicationById(id));
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────

    @PatchMapping("/applications/{id}/status")
    @Operation(summary = "Update the status (and optionally notes) of an application")
    public ResponseEntity<Response> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request) {
        return ResponseEntity.ok(service.updateStatus(id, request));
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────

    @DeleteMapping("/applications/{id}")
    @Operation(summary = "Delete an application")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }

    // ─── RESUME ANALYSIS ─────────────────────────────────────────────────────

    @PostMapping("/resume/analyze")
    @Operation(summary = "Analyze resume vs job description — returns match score & suggestions")
    public ResponseEntity<AnalyzeResponse> analyzeResume(@Valid @RequestBody AnalyzeRequest request) {
        return ResponseEntity.ok(service.analyzeResumeVsJd(request));
    }

    // ─── DASHBOARD ────────────────────────────────────────────────────────────

    @GetMapping("/dashboard/summary")
    @Operation(summary = "Get application counts grouped by status")
    public ResponseEntity<Map<String, Long>> getSummary() {
        return ResponseEntity.ok(service.getStatusSummary());
    }
}
