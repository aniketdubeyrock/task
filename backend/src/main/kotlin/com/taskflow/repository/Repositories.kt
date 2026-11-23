package com.taskflow.repository

import com.taskflow.domain.Project
import com.taskflow.domain.Task
import com.taskflow.domain.TaskActivity
import com.taskflow.domain.TaskStatus
import com.taskflow.domain.User
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.domain.Specification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.Instant
import java.util.UUID

@Repository
interface UserRepository : JpaRepository<User, UUID> {
    fun findByEmail(email: String): User?
    fun existsByEmail(email: String): Boolean
}

@Repository
interface ProjectRepository : JpaRepository<Project, UUID> {
    fun findAllByOwnerIdOrderByCreatedAtDesc(ownerId: UUID): List<Project>
    fun findByIdAndOwnerId(id: UUID, ownerId: UUID): Project?

    @Query("""
        SELECT DISTINCT p FROM Project p 
        LEFT JOIN Task t ON t.project = p 
        WHERE p.owner.id = :userId OR t.assignee.id = :userId 
        ORDER BY p.createdAt DESC
    """)
    fun findAllByOwnerOrAssignee(@Param("userId") userId: UUID): List<Project>
}

@Repository
interface TaskRepository : JpaRepository<Task, UUID>, JpaSpecificationExecutor<Task> {
    fun findAllByProjectId(projectId: UUID): List<Task>
    fun countByProjectIdAndStatus(projectId: UUID, status: TaskStatus): Long
    fun existsByProjectIdAndAssigneeId(projectId: UUID, assigneeId: UUID): Boolean

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.dueDate < :now AND t.status != 'DONE'")
    fun countOverdueTasks(
        @Param("projectId") projectId: UUID,
        @Param("now") now: Instant
    ): Long

    @Query("""
        SELECT t FROM Task t 
        WHERE t.assignee.id = :userId OR t.project.owner.id = :userId 
        ORDER BY t.createdAt DESC
    """)
    fun findAllByAssigneeOrOwner(@Param("userId") userId: UUID): List<Task>
}

@Repository
interface TaskActivityRepository : JpaRepository<TaskActivity, UUID> {
    fun findAllByTaskIdOrderByCreatedAtDesc(taskId: UUID): List<TaskActivity>
}

@Repository
interface NotificationRepository : JpaRepository<com.taskflow.domain.Notification, UUID> {
    fun findAllByRecipientIdOrderByCreatedAtDesc(recipientId: UUID): List<com.taskflow.domain.Notification>
    fun countByRecipientIdAndIsReadFalse(recipientId: UUID): Long
}
