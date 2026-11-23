package com.taskflow.controller

import com.taskflow.domain.User
import com.taskflow.dto.ApiResponse
import com.taskflow.dto.CreateProjectRequest
import com.taskflow.dto.ProjectDto
import com.taskflow.dto.ProjectSummaryDto
import com.taskflow.service.ProjectService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/projects")
@Tag(name = "Projects", description = "Project management and summary statistics")
class ProjectController(
    private val projectService: ProjectService
) {

    @GetMapping
    @Operation(summary = "List current user's projects")
    fun listProjects(@AuthenticationPrincipal user: User): ResponseEntity<ApiResponse<List<ProjectDto>>> {
        val projects = projectService.listProjects(user)
        return ResponseEntity.ok(ApiResponse(success = true, data = projects))
    }

    @PostMapping
    @Operation(summary = "Create a new project")
    fun createProject(
        @Valid @RequestBody request: CreateProjectRequest,
        @AuthenticationPrincipal user: User
    ): ResponseEntity<ApiResponse<ProjectDto>> {
        val project = projectService.createProject(request, user)
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse(success = true, data = project, message = "Project created successfully")
        )
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a project by ID")
    fun getProject(
        @PathVariable id: UUID,
        @AuthenticationPrincipal user: User
    ): ResponseEntity<ApiResponse<ProjectDto>> {
        val project = projectService.getProject(id, user)
        return ResponseEntity.ok(ApiResponse(success = true, data = project))
    }

    @GetMapping("/{id}/summary")
    @Operation(summary = "Get project summary counts per status and overdue tasks")
    fun getProjectSummary(
        @PathVariable id: UUID,
        @AuthenticationPrincipal user: User
    ): ResponseEntity<ApiResponse<ProjectSummaryDto>> {
        val summary = projectService.getProjectSummary(id, user)
        return ResponseEntity.ok(ApiResponse(success = true, data = summary))
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a project and its associated tasks")
    fun deleteProject(
        @PathVariable id: UUID,
        @AuthenticationPrincipal user: User
    ): ResponseEntity<ApiResponse<Unit>> {
        projectService.deleteProject(id, user)
        return ResponseEntity.ok(ApiResponse(success = true, message = "Project deleted successfully"))
    }
}
