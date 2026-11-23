package com.taskflow.service

import com.taskflow.domain.Notification
import com.taskflow.domain.Role
import com.taskflow.domain.Task
import com.taskflow.domain.TaskActivity
import com.taskflow.domain.TaskPriority
import com.taskflow.domain.TaskStatus
import com.taskflow.domain.User
import com.taskflow.dto.CreateTaskRequest
import com.taskflow.dto.TaskActivityDto
import com.taskflow.dto.TaskDto
import com.taskflow.dto.UpdateTaskRequest
import com.taskflow.dto.UpdateTaskStatusRequest
import com.taskflow.dto.toDto
import com.taskflow.exception.BadRequestException
import com.taskflow.exception.ForbiddenException
import com.taskflow.exception.ResourceNotFoundException
import com.taskflow.repository.NotificationRepository
import com.taskflow.repository.ProjectRepository
import com.taskflow.repository.TaskActivityRepository
import com.taskflow.repository.TaskRepository
import com.taskflow.repository.UserRepository
import com.taskflow.service.strategy.TaskSortingContext
import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
class TaskService(
    private val taskRepository: TaskRepository,
    private val projectRepository: ProjectRepository,
    private val userRepository: UserRepository,
    private val taskActivityRepository: TaskActivityRepository,
    private val notificationRepository: NotificationRepository,
    private val projectService: ProjectService,
    private val sortingContext: TaskSortingContext
) {

    @Transactional(readOnly = true)
    fun getTasks(
        projectId: UUID,
        status: TaskStatus?,
        priority: TaskPriority?,
        assigneeId: UUID?,
        sortBy: String?,
        sortOrder: String?,
        user: User
    ): List<TaskDto> {
        // Verify project ownership
        projectService.findProjectAndVerifyOwnership(projectId, user)

        // Dynamic specification for filtering
        var spec = Specification<Task> { root, _, cb ->
            cb.equal(root.get<Any>("project").get<UUID>("id"), projectId)
        }

        if (status != null) {
            spec = spec.and { root, _, cb -> cb.equal(root.get<TaskStatus>("status"), status) }
        }
        if (priority != null) {
            spec = spec.and { root, _, cb -> cb.equal(root.get<TaskPriority>("priority"), priority) }
        }
        if (assigneeId != null) {
            spec = spec.and { root, _, cb -> cb.equal(root.get<Any>("assignee").get<UUID>("id"), assigneeId) }
        }

        // Apply Strategy Pattern for sorting
        val sort = sortingContext.resolveSort(sortBy, sortOrder)
        return taskRepository.findAll(spec, sort).map { it.toDto() }
    }

    @Transactional(readOnly = true)
    fun getTask(taskId: UUID, user: User): TaskDto {
        val task = findTaskAndVerifyOwnership(taskId, user)
        return task.toDto()
    }

    @Transactional(readOnly = true)
    fun getMyTasks(user: User): List<TaskDto> {
        val userId = user.id ?: throw IllegalStateException("Authenticated user ID must not be null")
        return if (user.role == Role.SUPERADMIN) {
            taskRepository.findAll().map { it.toDto() }
        } else {
            taskRepository.findAllByAssigneeOrOwner(userId).map { it.toDto() }
        }
    }

    @Transactional
    fun createTask(projectId: UUID, request: CreateTaskRequest, user: User): TaskDto {
        val project = projectService.findProjectAndVerifyOwnership(projectId, user)

        // Validate dueDate: not in the past on creation (with 60-second clock skew tolerance)
        val now = Instant.now().minusSeconds(60)
        if (request.dueDate != null && request.dueDate.isBefore(now)) {
            throw BadRequestException("Due date cannot be in the past on task creation")
        }

        val assignee = request.assigneeId?.let {
            userRepository.findById(it).orElseThrow { ResourceNotFoundException("Assignee user not found") }
        }

        val task = taskRepository.save(
            Task(
                title = request.title.trim(),
                description = request.description?.trim(),
                priority = request.priority,
                dueDate = request.dueDate,
                assignee = assignee,
                project = project,
                status = TaskStatus.TODO
            )
        )

        // Log task activity
        taskActivityRepository.save(
            TaskActivity(
                task = task,
                user = user,
                action = "CREATED",
                newValue = "Task created with status TODO"
            )
        )

        // Dispatch in-app notification to assignee
        if (assignee != null && assignee.id != user.id) {
            notificationRepository.save(
                Notification(
                    recipient = assignee,
                    actor = user,
                    task = task,
                    title = "New Task Assigned",
                    message = "${user.name} assigned you '${task.title}' in '${project.name}'"
                )
            )
        }

        return task.toDto()
    }

    @Transactional
    fun updateTask(taskId: UUID, request: UpdateTaskRequest, user: User): TaskDto {
        val task = findTaskAndVerifyOwnership(taskId, user)

        val assignee = request.assigneeId?.let {
            userRepository.findById(it).orElseThrow { ResourceNotFoundException("Assignee user not found") }
        }

        val oldAssigneeId = task.assignee?.id

        task.title = request.title.trim()
        task.description = request.description?.trim()
        task.priority = request.priority
        task.dueDate = request.dueDate
        task.assignee = assignee
        task.updatedAt = Instant.now()

        val updatedTask = taskRepository.save(task)

        taskActivityRepository.save(
            TaskActivity(
                task = updatedTask,
                user = user,
                action = "UPDATED",
                newValue = "Task details updated"
            )
        )

        // Notify if newly assigned or reassigned
        if (assignee != null && assignee.id != user.id && (oldAssigneeId != assignee.id)) {
            notificationRepository.save(
                Notification(
                    recipient = assignee,
                    actor = user,
                    task = updatedTask,
                    title = "Task Assigned",
                    message = "${user.name} assigned you '${updatedTask.title}' in '${task.project.name}'"
                )
            )
        }

        return updatedTask.toDto()
    }

    @Transactional
    fun updateTaskStatus(taskId: UUID, request: UpdateTaskStatusRequest, user: User): TaskDto {
        val task = findTaskAndVerifyOwnership(taskId, user)
        val oldStatus = task.status
        task.status = request.status
        task.updatedAt = Instant.now()

        val updatedTask = taskRepository.save(task)

        taskActivityRepository.save(
            TaskActivity(
                task = updatedTask,
                user = user,
                action = "STATUS_CHANGED",
                oldValue = oldStatus.name,
                newValue = request.status.name
            )
        )

        return updatedTask.toDto()
    }

    @Transactional
    fun deleteTask(taskId: UUID, user: User) {
        val task = findTaskAndVerifyOwnership(taskId, user)
        if (user.role != Role.SUPERADMIN && task.project.owner.id != user.id) {
            throw ForbiddenException("Only project owners can delete tasks")
        }
        taskRepository.delete(task)
    }

    @Transactional(readOnly = true)
    fun getTaskActivities(taskId: UUID, user: User): List<TaskActivityDto> {
        findTaskAndVerifyOwnership(taskId, user)
        return taskActivityRepository.findAllByTaskIdOrderByCreatedAtDesc(taskId).map { it.toDto() }
    }

    private fun findTaskAndVerifyOwnership(taskId: UUID, user: User): Task {
        val task = taskRepository.findById(taskId).orElseThrow {
            ResourceNotFoundException("Task with id '$taskId' not found")
        }

        val isOwner = task.project.owner.id == user.id
        val isAssignee = task.assignee?.id == user.id
        if (user.role != Role.SUPERADMIN && !isOwner && !isAssignee) {
            throw ForbiddenException("You do not have access to this task")
        }

        return task
    }
}
