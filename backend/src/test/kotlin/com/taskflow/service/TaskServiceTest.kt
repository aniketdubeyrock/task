package com.taskflow.service

import com.taskflow.domain.*
import com.taskflow.dto.CreateTaskRequest
import com.taskflow.dto.UpdateTaskStatusRequest
import com.taskflow.exception.BadRequestException
import com.taskflow.exception.ForbiddenException
import com.taskflow.repository.NotificationRepository
import com.taskflow.repository.ProjectRepository
import com.taskflow.repository.TaskActivityRepository
import com.taskflow.repository.TaskRepository
import com.taskflow.repository.UserRepository
import com.taskflow.service.strategy.TaskSortingContext
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.*

class TaskServiceTest {

    private val taskRepository: TaskRepository = mockk()
    private val projectRepository: ProjectRepository = mockk()
    private val userRepository: UserRepository = mockk()
    private val taskActivityRepository: TaskActivityRepository = mockk()
    private val notificationRepository: NotificationRepository = mockk(relaxed = true)
    private val projectService: ProjectService = mockk()
    private val sortingContext: TaskSortingContext = mockk()

    private lateinit var taskService: TaskService

    private val testUser = User(
        id = UUID.randomUUID(),
        name = "Jane Developer",
        email = "jane@taskflow.dev",
        password = "hashed_password",
        role = Role.USER
    )

    private val testProject = Project(
        id = UUID.randomUUID(),
        name = "Sprint 1",
        description = "Test description",
        owner = testUser
    )

    @BeforeEach
    fun setup() {
        taskService = TaskService(
            taskRepository = taskRepository,
            projectRepository = projectRepository,
            userRepository = userRepository,
            taskActivityRepository = taskActivityRepository,
            notificationRepository = notificationRepository,
            projectService = projectService,
            sortingContext = sortingContext
        )
    }

    @Test
    fun `createTask succeeds with valid future due date`() {
        val futureDueDate = Instant.now().plus(3, ChronoUnit.DAYS)
        val request = CreateTaskRequest(
            title = "Build REST API",
            description = "Kotlin + Spring Boot",
            priority = TaskPriority.HIGH,
            dueDate = futureDueDate
        )

        every { projectService.findProjectAndVerifyOwnership(testProject.id!!, testUser) } returns testProject
        every { taskRepository.save(any()) } answers {
            val saved = firstArg<Task>()
            saved.id = UUID.randomUUID()
            saved
        }
        every { taskActivityRepository.save(any()) } returns mockk()

        val result = taskService.createTask(testProject.id!!, request, testUser)

        assertNotNull(result)
        assertEquals("Build REST API", result.title)
        assertEquals(TaskStatus.TODO, result.status)
        assertEquals(TaskPriority.HIGH, result.priority)

        verify(exactly = 1) { taskRepository.save(any()) }
        verify(exactly = 1) { taskActivityRepository.save(any()) }
    }

    @Test
    fun `createTask throws BadRequestException when due date is in the past`() {
        val pastDueDate = Instant.now().minus(2, ChronoUnit.DAYS)
        val request = CreateTaskRequest(
            title = "Overdue task on create",
            dueDate = pastDueDate
        )

        every { projectService.findProjectAndVerifyOwnership(testProject.id!!, testUser) } returns testProject

        val exception = assertThrows<BadRequestException> {
            taskService.createTask(testProject.id!!, request, testUser)
        }

        assertTrue(exception.message!!.contains("Due date cannot be in the past"))
        verify(exactly = 0) { taskRepository.save(any()) }
    }

    @Test
    fun `updateTaskStatus successfully changes status and records activity`() {
        val taskId = UUID.randomUUID()
        val existingTask = Task(
            id = taskId,
            title = "Implement DND",
            status = TaskStatus.TODO,
            project = testProject
        )

        every { taskRepository.findById(taskId) } returns Optional.of(existingTask)
        every { taskRepository.save(any()) } answers { firstArg() }
        every { taskActivityRepository.save(any()) } returns mockk()

        val request = UpdateTaskStatusRequest(status = TaskStatus.IN_PROGRESS)
        val result = taskService.updateTaskStatus(taskId, request, testUser)

        assertEquals(TaskStatus.IN_PROGRESS, result.status)
        verify(exactly = 1) {
            taskActivityRepository.save(match {
                it.action == "STATUS_CHANGED" && it.oldValue == "TODO" && it.newValue == "IN_PROGRESS"
            })
        }
    }
}
