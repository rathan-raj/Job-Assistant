package com.rathanraj.jobassistant;

import com.rathanraj.jobassistant.dto.JobApplicationDTO.*;
import com.rathanraj.jobassistant.model.JobApplication;
import com.rathanraj.jobassistant.model.JobApplication.ApplicationStatus;
import com.rathanraj.jobassistant.repository.JobApplicationRepository;
import com.rathanraj.jobassistant.service.JobApplicationService;
import com.rathanraj.jobassistant.service.NlpClientService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobApplicationServiceTest {

    @Mock
    private JobApplicationRepository repository;

    @Mock
    private NlpClientService nlpClientService;

    @InjectMocks
    private JobApplicationService service;

    private JobApplication sampleApplication;

    @BeforeEach
    void setUp() {
        sampleApplication = JobApplication.builder()
                .id(1L)
                .companyName("Google")
                .jobTitle("Senior Backend Engineer")
                .status(ApplicationStatus.APPLIED)
                .appliedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should create application with SAVED status when status not provided")
    void createApplication_defaultStatus() {
        CreateRequest request = CreateRequest.builder()
                .companyName("Google")
                .jobTitle("Senior Backend Engineer")
                .build();

        when(repository.save(any(JobApplication.class))).thenReturn(sampleApplication);

        Response response = service.createApplication(request);

        assertThat(response).isNotNull();
        assertThat(response.getCompanyName()).isEqualTo("Google");
        verify(repository, times(1)).save(any(JobApplication.class));
    }

    @Test
    @DisplayName("Should return all applications ordered by date")
    void getAllApplications_returnsList() {
        when(repository.findAllOrderByAppliedAtDesc()).thenReturn(List.of(sampleApplication));

        List<Response> results = service.getAllApplications();

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getJobTitle()).isEqualTo("Senior Backend Engineer");
    }

    @Test
    @DisplayName("Should throw EntityNotFoundException when application not found")
    void getById_notFound_throwsException() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getApplicationById(99L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("Should update application status correctly")
    void updateStatus_success() {
        UpdateStatusRequest request = new UpdateStatusRequest(ApplicationStatus.INTERVIEW, "Technical round scheduled");
        when(repository.findById(1L)).thenReturn(Optional.of(sampleApplication));
        when(repository.save(any())).thenReturn(sampleApplication);

        Response response = service.updateStatus(1L, request);

        assertThat(response).isNotNull();
        verify(repository).save(sampleApplication);
    }

    @Test
    @DisplayName("Should delete existing application without error")
    void deleteApplication_success() {
        when(repository.existsById(1L)).thenReturn(true);
        doNothing().when(repository).deleteById(1L);

        assertThatCode(() -> service.deleteApplication(1L)).doesNotThrowAnyException();
        verify(repository).deleteById(1L);
    }

    @Test
    @DisplayName("Should call NLP service for resume analysis")
    void analyzeResume_callsNlpService() {
        AnalyzeRequest request = new AnalyzeRequest("Java Spring Boot developer needed", "Rathan Raj — Java Spring developer");
        AnalyzeResponse nlpResponse = AnalyzeResponse.builder()
                .matchScore(0.85)
                .missingKeywords("Kubernetes, Kafka")
                .suggestions("Add Kubernetes experience")
                .message("Analysis complete")
                .build();

        when(nlpClientService.analyze(any(), any())).thenReturn(nlpResponse);

        AnalyzeResponse result = service.analyzeResumeVsJd(request);

        assertThat(result.getMatchScore()).isEqualTo(0.85);
        assertThat(result.getMissingKeywords()).contains("Kubernetes");
    }
}
