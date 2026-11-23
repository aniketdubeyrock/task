package com.taskflow.service

import com.taskflow.domain.Project
import com.taskflow.domain.Role
import com.taskflow.domain.TaskStatus
import com.taskflow.domain.User
import com.taskflow.dto.CreateProjectRequest
import com.taskflow.dto.ProjectDto
import com.taskflow.dto.ProjectSummaryDto
import com.taskflow.dto.toDto
import com.taskflow.exception.ForbiddenException
import com.taskflow.exception.ResourceNotFoundException
import com.taskflow.repository.ProjectRepository
import com.taskflow.repository.TaskRepository
import com.taskflow.repository.TaskActivityRepository
import com.taskflow.repository.NotificationRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
class ProjectService(
    private val projectRepository: ProjectRepository,
    private val taskRepository: TaskRepository,
    private val taskActivityRepository: TaskActivityRepository,
    private val notificationRepository: NotificationRepository
) {

    @Transactional(readOnly = true)
    fun listProjects(user: User): List<ProjectDto> {
        val projects = if (user.role == Role.SUPERADMIN) {
            projectRepository.findAll()
        } else {
            projectRepository.findAllByOwnerOrAssignee(user.id!!)
        }
        val now = Instant.now()
        return projects.map { project ->
            val tasks = taskRepository.findAllByProjectId(project.id!!)
            val total = tasks.size.toLong()
            val completed = tasks.count { it.status == TaskStatus.DONE }.toLong()
            val overdue = tasks.count { it.dueDate != null && it.dueDate!!.isBefore(now) && it.status != TaskStatus.DONE }.toLong()
            val progress = if (total > 0) ((completed.toDouble() / total.toDouble()) * 100).toInt() else 0

            project.toDto(
                stats = com.taskflow.dto.ProjectStatsDto(
                    totalTasks = total,
                    completedTasks = completed,
                    overdueTasks = overdue,
                    progress = progress
                )
            )
        }
    }

    @Transactional
    fun createProject(request: CreateProjectRequest, user: User): ProjectDto {
        val project = projectRepository.save(
            Project(
                name = request.name.trim(),
                description = request.description?.trim(),
                owner = user
            )
        )
        return project.toDto(
            stats = com.taskflow.dto.ProjectStatsDto(
                totalTasks = 0,
                completedTasks = 0,
                overdueTasks = 0,
                progress = 0
            )
        )
    }

    @Transactional(readOnly = true)
    fun getProject(projectId: UUID, user: User): ProjectDto {
        val project = findProjectAndVerifyOwnership(projectId, user)
        val now = Instant.now()
        val tasks = taskRepository.findAllByProjectId(project.id!!)
        val total = tasks.size.toLong()
        val completed = tasks.count { it.status == TaskStatus.DONE }.toLong()
        val overdue = tasks.count { it.dueDate != null && it.dueDate!!.isBefore(now) && it.status != TaskStatus.DONE }.toLong()
        val progress = if (total > 0) ((completed.toDouble() / total.toDouble()) * 100).toInt() else 0

        return project.toDto(
            stats = com.taskflow.dto.ProjectStatsDto(
                totalTasks = total,
                completedTasks = completed,
                overdueTasks = overdue,
                progress = progress
            )
        )
    }

    @Transactional(readOnly = true)
    fun getProjectSummary(projectId: UUID, user: User): ProjectSummaryDto {
        findProjectAndVerifyOwnership(projectId, user)

        val totalTasks = taskRepository.findAllByProjectId(projectId).size.toLong()
        val todoCount = taskRepository.countByProjectIdAndStatus(projectId, TaskStatus.TODO)
        val inProgressCount = taskRepository.countByProjectIdAndStatus(projectId, TaskStatus.IN_PROGRESS)
        val doneCount = taskRepository.countByProjectIdAndStatus(projectId, TaskStatus.DONE)
        val overdueCount = taskRepository.countOverdueTasks(projectId, Instant.now())

        val progressPercentage = if (totalTasks > 0) {
            (doneCount.toDouble() / totalTasks.toDouble()) * 100.0
        } else {
            0.0
        }

        return ProjectSummaryDto(
            projectId = projectId,
            totalTasks = totalTasks,
            todoCount = todoCount,
            inProgressCount = inProgressCount,
            doneCount = doneCount,
            overdueCount = overdueCount,
            progressPercentage = Math.round(progressPercentage * 10.0) / 10.0
        )
    }

    fun findProjectAndVerifyOwnership(projectId: UUID, user: User): Project {
        val project = projectRepository.findById(projectId).orElseThrow {
            ResourceNotFoundException("Project with id '$projectId' not found")
        }

        val isOwner = project.owner.id == user.id
        val isAssignee = taskRepository.existsByProjectIdAndAssigneeId(projectId, user.id!!)
        if (user.role != Role.SUPERADMIN && !isOwner && !isAssignee) {
            throw ForbiddenException("You do not have access to this project")
        }

        return project
    }

    @Transactional
    fun deleteProject(projectId: UUID, user: User) {
        val project = findProjectAndVerifyOwnership(projectId, user)
        if (user.role != Role.SUPERADMIN && project.owner.id != user.id) {
            throw ForbiddenException("Only the project owner or superadmin can delete this project")
        }
        val tasks = taskRepository.findAllByProjectId(projectId)
        for (task in tasks) {
            val taskId = task.id!!
            taskActivityRepository.deleteAll(taskActivityRepository.findAllByTaskIdOrderByCreatedAtDesc(taskId))
            val notifs = notificationRepository.findAll().filter { n -> n.task?.id == taskId }
            notificationRepository.deleteAll(notifs)
            taskRepository.delete(task)
        }
        projectRepository.delete(project)
    }
}
