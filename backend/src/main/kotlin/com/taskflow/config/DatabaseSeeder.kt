package com.taskflow.config

import com.taskflow.domain.Notification
import com.taskflow.domain.Project
import com.taskflow.domain.Role
import com.taskflow.domain.Task
import com.taskflow.domain.TaskPriority
import com.taskflow.domain.TaskStatus
import com.taskflow.domain.User
import com.taskflow.repository.NotificationRepository
import com.taskflow.repository.ProjectRepository
import com.taskflow.repository.TaskRepository
import com.taskflow.repository.UserRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import java.time.Instant
import java.time.temporal.ChronoUnit

@Component
class DatabaseSeeder(
    private val userRepository: UserRepository,
    private val projectRepository: ProjectRepository,
    private val taskRepository: TaskRepository,
    private val notificationRepository: NotificationRepository,
    private val passwordEncoder: PasswordEncoder
) : CommandLineRunner {

    override fun run(vararg args: String?) {
        val superadminEmail = "superadmin@taskflow.dev"
        if (userRepository.findByEmail(superadminEmail) != null) {
            println("ℹ️ [DB-SEEDER] Superadmin already exists. Skipping initial database seeding.")
            return
        }

        println("🌱 [DB-SEEDER] Starting automatic initial database seeding...")

        // 1. Seed Superadmin
        val superadmin = userRepository.save(
            User(
                name = "Super Admin",
                email = superadminEmail,
                password = passwordEncoder.encode("SuperAdmin123!"),
                role = Role.SUPERADMIN
            )
        )
        println("✅ [DB-SEEDER] Superadmin created: ${superadmin.email}")

        // 2. Seed Team Members
        val jane = userRepository.save(
            User(
                name = "Jane Developer",
                email = "jane@taskflow.dev",
                password = passwordEncoder.encode("Password123!"),
                role = Role.USER
            )
        )
        val bob = userRepository.save(
            User(
                name = "Bob Designer",
                email = "bob@taskflow.dev",
                password = passwordEncoder.encode("Password123!"),
                role = Role.USER
            )
        )
        println("✅ [DB-SEEDER] Demo team members created: ${jane.email}, ${bob.email}")

        // 3. Seed Demo Project
        val project = projectRepository.save(
            Project(
                name = "E-commerce Platform Redesign",
                description = "Modernizing our customer storefront with high-performance React UI and reactive Spring Boot backend services.",
                owner = superadmin
            )
        )
        println("✅ [DB-SEEDER] Demo project created: ${project.name}")

        // 4. Seed Tasks across TODO, IN_PROGRESS, DONE & Overdue test cases
        val now = Instant.now()
        val tasks = listOf(
            Task(
                title = "Design Database Schema & ERD",
                description = "Define relational PostgreSQL tables for users, projects, tasks, and audit logs.",
                status = TaskStatus.DONE,
                priority = TaskPriority.HIGH,
                dueDate = now.minus(3, ChronoUnit.DAYS),
                assignee = jane,
                project = project
            ),
            Task(
                title = "Setup Spring Boot 3 & JWT Auth",
                description = "Configure Spring Security 6 stateless filter chain, BCrypt hashing, and role checks.",
                status = TaskStatus.DONE,
                priority = TaskPriority.HIGH,
                dueDate = now.minus(1, ChronoUnit.DAYS),
                assignee = jane,
                project = project
            ),
            Task(
                title = "Implement Kanban Board Drag-and-Drop",
                description = "Integrate interactive columns with optimistic reordering and status synchronization.",
                status = TaskStatus.IN_PROGRESS,
                priority = TaskPriority.HIGH,
                dueDate = now.plus(2, ChronoUnit.DAYS),
                assignee = bob,
                project = project
            ),
            Task(
                title = "Fix Critical Security Vulnerability in Token Refresh",
                description = "Review expiry timestamps and prevent replay attacks with rotated refresh tokens.",
                status = TaskStatus.IN_PROGRESS,
                priority = TaskPriority.HIGH,
                dueDate = now.minus(1, ChronoUnit.DAYS), // Overdue test case!
                assignee = jane,
                project = project
            ),
            Task(
                title = "Write Unit & Integration Tests",
                description = "Cover TaskService with JUnit 5 + MockK and verify REST contracts with @SpringBootTest.",
                status = TaskStatus.TODO,
                priority = TaskPriority.MEDIUM,
                dueDate = now.plus(4, ChronoUnit.DAYS),
                assignee = jane,
                project = project
            ),
            Task(
                title = "Deploy to Production & Setup Docker",
                description = "Prepare multi-stage Dockerfile and Docker Compose orchestration.",
                status = TaskStatus.TODO,
                priority = TaskPriority.LOW,
                dueDate = now.plus(7, ChronoUnit.DAYS),
                assignee = null,
                project = project
            )
        )
        val savedTasks = taskRepository.saveAll(tasks)
        println("✅ [DB-SEEDER] ${tasks.size} sample tasks seeded (including overdue and in-progress tasks).")

        // Seed demo notification for Jane
        notificationRepository.save(
            Notification(
                recipient = jane,
                actor = superadmin,
                task = savedTasks[2],
                title = "New Task Assigned",
                message = "Super Admin assigned you 'Fix Critical Security Vulnerability in Token Refresh' in '${project.name}'",
                isRead = false
            )
        )
        println("✅ [DB-SEEDER] Initial notification seeded for ${jane.email}")

        println("==================================================")
        println("🎉 Database seeding finished successfully!")
        println("🔑 Superadmin: superadmin@taskflow.dev / SuperAdmin123!")
        println("🔑 Team Member: jane@taskflow.dev / Password123!")
        println("==================================================")
    }
}
