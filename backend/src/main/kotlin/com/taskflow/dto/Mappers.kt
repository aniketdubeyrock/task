package com.taskflow.dto

import com.taskflow.domain.Project
import com.taskflow.domain.Task
import com.taskflow.domain.TaskActivity
import com.taskflow.domain.User
import java.time.Instant

// Factory / Mapper pattern for converting JPA entities to safe DTOs
fun User.toDto(): UserDto = UserDto(
    id = this.id!!,
    name = this.name,
    email = this.email,
    role = this.role,
    createdAt = this.createdAt
)

fun Project.toDto(stats: ProjectStatsDto? = null): ProjectDto = ProjectDto(
    id = this.id!!,
    name = this.name,
    description = this.description,
    ownerId = this.owner.id!!,
    createdAt = this.createdAt,
    stats = stats
)

fun Task.toDto(): TaskDto {
    val now = Instant.now()
    val isOverdue = this.dueDate != null && this.dueDate!!.isBefore(now) && this.status != com.taskflow.domain.TaskStatus.DONE

    return TaskDto(
        id = this.id!!,
        title = this.title,
        description = this.description,
        status = this.status,
        priority = this.priority,
        dueDate = this.dueDate,
        isOverdue = isOverdue,
        projectId = this.project.id!!,
        assignee = this.assignee?.toDto(),
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )
}

fun TaskActivity.toDto(): TaskActivityDto = TaskActivityDto(
    id = this.id!!,
    taskId = this.task.id!!,
    user = this.user.toDto(),
    action = this.action,
    oldValue = this.oldValue,
    newValue = this.newValue,
    createdAt = this.createdAt
)

fun com.taskflow.domain.Notification.toDto(): NotificationDto = NotificationDto(
    id = this.id!!,
    recipientId = this.recipient.id!!,
    actor = this.actor?.toDto(),
    taskId = this.task?.id,
    title = this.title,
    message = this.message,
    isRead = this.isRead,
    createdAt = this.createdAt
)
