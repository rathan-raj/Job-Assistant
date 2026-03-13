package com.rathanraj.jobassistant.repository;

import com.rathanraj.jobassistant.model.JobApplication;
import com.rathanraj.jobassistant.model.JobApplication.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByStatusOrderByAppliedAtDesc(ApplicationStatus status);

    List<JobApplication> findByCompanyNameContainingIgnoreCaseOrJobTitleContainingIgnoreCase(
            String company, String title);

    @Query("SELECT j FROM JobApplication j ORDER BY j.appliedAt DESC")
    List<JobApplication> findAllOrderByAppliedAtDesc();

    @Query("SELECT COUNT(j) FROM JobApplication j WHERE j.status = :status")
    Long countByStatus(ApplicationStatus status);

    @Query("SELECT j.status, COUNT(j) FROM JobApplication j GROUP BY j.status")
    List<Object[]> countGroupedByStatus();
}
