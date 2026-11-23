package com.taskflow.controller

import com.taskflow.domain.TaskPriority
import com.taskflow.domain.TaskStatus
import com.taskflow.domain.User
import com.taskflow.dto.ApiResponse
import com.taskflow.dto.CreateTaskRequest
import com.taskflow.dto.TaskActivityDto
import com.taskflow.dto.TaskDto
import com.taskflow.dto.UpdateTaskRequest
import com.taskflow.dto.UpdateTaskStatusRequest
import com.taskflow.service.TaskService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api")
@Tag(name = "Tasks", description = "Task tracking, Kanban status progression, and activity audit")
class TaskController(
    private val taskService: TaskService
) {

    @GetMapping("/projects/{projectId}/tasks")
    @Operation(summary = "List tasks for a project with filters and sorting")
    fun getTasks(
        @PathVariable projectId: UUID,
        @RequestParam(required = false) status: TaskStatus?,
        @RequestParam(required = false) priority: TaskPriority?,
        @RequestParam(required = false) assigneeId: UUID?,
        @RequestParam(required = false, defaultValue = "createdAt") sortBy: String?,
        @RequestParam(required = false, defaultValue = "asc") sortOrder: String?,
        @AuthenticationPrincipal user: User
    ): ResponseEntity<ApiResponse<List<TaskDto>>> {
        val tasks = taskService.getTasks(projectId, status, priority, assigneeId, sortBy, sortOrder, user)
        return ResponseEntity.ok(ApiResponse(success = true, data = tasks))
    }

    @GetMapping("/tasks/my-tasks")
    @Operation(summary = "Get all tasks assigned to or owned by the authenticated user")
    fun getMyTasks(
        @AuthenticationPrincipal user: User
    ): ResponseEntity<ApiResponse<List<TaskDto>>> {
        val tasks = taskService.getMyTasks(user)
        return ResponseEntity.ok(ApiResponse(success = true, data = tasks))
    }

    @GetMapping("/tasks/{id}")
    @Operation(summary = "Get task details by ID")
    fun getTask(
        @PathVariable id: UUID,
        @AuthenticationPrincipal user: User
    ): ResponseEntity<ApiResponse<TaskDto>> {
        val task = taskService.getTask(id, user)
        return ResponseEntity.ok(ApiResponse(success = true, data = task))
    }

    @PostMapping("/projects/{projectId}/tasks")
    @Operation(summary = "Create a task in a project")
    fun createTask(
        @PathVariable projectId: UUID,
        @Valid @RequestBody request: CreateTaskRequest,
        @AuthenticationPrincipal user: User
    ): ResponseEntity<ApiResponse<TaskDto>> {
        val task = taskService.createTask(projectId, request, user)
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse(success = true, data = task, message = "Task created successfully")
        )
    }

    @PutMapping("/tasks/{id}")
    @Operation(summary = "Update an existing task")
    fun updateTask(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateTaskRequest,
        @AuthenticationPrincipal user: User
    ): ResponseEntity<ApiResponse<TaskDto>> {
        val task = taskService.updateTask(id, request, user)
        return ResponseEntity.ok(ApiResponse(success = true, data = task, message = "Task updated successfully"))
    }

    @PatchMapping("/tasks/{id}/status")
    @Operation(summary = "Update task status only (for Kanban drag-and-drop)")
    fun updateTaskStatus(
        @PathVariable id: UUID,
        @Valid @RequestBody request: UpdateTaskStatusRequest,
        @AuthenticationPrincipal user: User
    ): ResponseEntity<ApiResponse<TaskDto>> {
        val task = taskService.updateTaskStatus(id, request, user)
        return ResponseEntity.ok(ApiResponse(success = true, data = task, message = "Status updated successfully"))
    }

    @DeleteMapping("/tasks/{id}")
    @Operation(summary = "Delete a task")
    fun deleteTask(
        @PathVariable id: UUID,
        @AuthenticationPrincipal user: User
    ): ResponseEntity<ApiResponse<Unit>> {
        taskService.deleteTask(id, user)
        return ResponseEntity.ok(ApiResponse(success = true, message = "Task deleted successfully"))
    }

    @GetMapping("/tasks/{id}/activities")
    @Operation(summary = "Get task activity audit trail")
    fun getTaskActivities(
        @PathVariable id: UUID,
        @AuthenticationPrincipal user: User
    ): ResponseEntity<ApiResponse<List<TaskActivityDto>>> {
        val activities = taskService.getTaskActivities(id, user)
        return ResponseEntity.ok(ApiResponse(success = true, data = activities))
    }
}
