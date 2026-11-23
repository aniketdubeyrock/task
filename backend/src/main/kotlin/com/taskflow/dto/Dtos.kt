package com.taskflow.dto

import com.taskflow.domain.Role
import com.taskflow.domain.TaskPriority
import com.taskflow.domain.TaskStatus
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.Instant
import java.util.UUID

// Generic API Response Envelope
data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val message: String? = null,
    val error: ApiErrorDetail? = null
)

data class ApiErrorDetail(
    val message: String,
    val code: String,
    val details: Map<String, String>? = null
)

// Auth DTOs
data class RegisterRequest(
    @field:NotBlank(message = "Name is required")
    val name: String,

    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Invalid email format")
    val email: String,

    @field:NotBlank(message = "Password is required")
    @field:Size(min = 6, message = "Password must be at least 6 characters")
    val password: String
)

data class LoginRequest(
    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Invalid email format")
    val email: String,

    @field:NotBlank(message = "Password is required")
    val password: String
)

data class AuthResponse(
    val user: UserDto,
    val token: String
)

data class UpdateProfileRequest(
    @field:NotBlank(message = "Name is required")
    val name: String
)

data class ChangePasswordRequest(
    @field:NotBlank(message = "Current password is required")
    val currentPassword: String,

    @field:NotBlank(message = "New password is required")
    @field:Size(min = 6, message = "New password must be at least 6 characters")
    val newPassword: String
)

data class UserDto(
    val id: UUID,
    val name: String,
    val email: String,
    val role: Role,
    val createdAt: Instant
)

// Project DTOs
data class CreateProjectRequest(
    @field:NotBlank(message = "Project name is required")
    val name: String,

    val description: String? = null
)

data class ProjectStatsDto(
    val totalTasks: Long = 0,
    val completedTasks: Long = 0,
    val overdueTasks: Long = 0,
    val progress: Int = 0
)

data class ProjectDto(
    val id: UUID,
    val name: String,
    val description: String?,
    val ownerId: UUID,
    val createdAt: Instant,
    val stats: ProjectStatsDto? = null
)

data class ProjectSummaryDto(
    val projectId: UUID,
    val totalTasks: Long,
    val todoCount: Long,
    val inProgressCount: Long,
    val doneCount: Long,
    val overdueCount: Long,
    val progressPercentage: Double
)

// Task DTOs
data class CreateTaskRequest(
    @field:NotBlank(message = "Title is required")
    @field:Size(max = 120, message = "Title cannot exceed 120 characters")
    val title: String,

    val description: String? = null,

    val priority: TaskPriority = TaskPriority.MEDIUM,

    val dueDate: Instant? = null,

    val assigneeId: UUID? = null
)

data class UpdateTaskRequest(
    @field:NotBlank(message = "Title is required")
    @field:Size(max = 120, message = "Title cannot exceed 120 characters")
    val title: String,

    val description: String? = null,

    val priority: TaskPriority = TaskPriority.MEDIUM,

    val dueDate: Instant? = null,

    val assigneeId: UUID? = null
)

data class UpdateTaskStatusRequest(
    @field:NotNull(message = "Status is required")
    val status: TaskStatus
)

data class TaskDto(
    val id: UUID,
    val title: String,
    val description: String?,
    val status: TaskStatus,
    val priority: TaskPriority,
    val dueDate: Instant?,
    val isOverdue: Boolean,
    val projectId: UUID,
    val assignee: UserDto?,
    val createdAt: Instant,
    val updatedAt: Instant
)

data class TaskActivityDto(
    val id: UUID,
    val taskId: UUID,
    val user: UserDto,
    val action: String,
    val oldValue: String?,
    val newValue: String?,
    val createdAt: Instant
)

data class NotificationDto(
    val id: UUID,
    val recipientId: UUID,
    val actor: UserDto?,
    val taskId: UUID?,
    val title: String,
    val message: String,
    val isRead: Boolean,
    val createdAt: Instant
)
