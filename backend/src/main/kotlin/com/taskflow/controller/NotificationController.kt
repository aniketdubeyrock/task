package com.taskflow.controller

import com.taskflow.domain.User
import com.taskflow.dto.ApiResponse
import com.taskflow.dto.NotificationDto
import com.taskflow.dto.toDto
import com.taskflow.exception.ResourceNotFoundException
import com.taskflow.repository.NotificationRepository
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "In-app notifications for task assignments and team alerts")
class NotificationController(
    private val notificationRepository: NotificationRepository
) {

    @GetMapping
    @Operation(summary = "List all notifications for current authenticated user")
    @Transactional(readOnly = true)
    fun getNotifications(@AuthenticationPrincipal user: User): ResponseEntity<ApiResponse<List<NotificationDto>>> {
        val notifications = notificationRepository.findAllByRecipientIdOrderByCreatedAtDesc(user.id!!)
            .map { it.toDto() }
        return ResponseEntity.ok(ApiResponse(success = true, data = notifications))
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark single notification as read")
    @Transactional
    fun markAsRead(
        @PathVariable id: UUID,
        @AuthenticationPrincipal user: User
    ): ResponseEntity<ApiResponse<NotificationDto>> {
        val notification = notificationRepository.findById(id).orElseThrow {
            ResourceNotFoundException("Notification with id '$id' not found")
        }

        if (notification.recipient.id != user.id) {
            return ResponseEntity.status(403).body(
                ApiResponse(success = false, message = "You cannot mark this notification")
            )
        }

        notification.isRead = true
        val saved = notificationRepository.save(notification)
        return ResponseEntity.ok(ApiResponse(success = true, data = saved.toDto()))
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read for current user")
    @Transactional
    fun markAllAsRead(@AuthenticationPrincipal user: User): ResponseEntity<ApiResponse<Map<String, Int>>> {
        val notifications = notificationRepository.findAllByRecipientIdOrderByCreatedAtDesc(user.id!!)
        var updatedCount = 0
        notifications.forEach {
            if (!it.isRead) {
                it.isRead = true
                notificationRepository.save(it)
                updatedCount++
            }
        }
        return ResponseEntity.ok(
            ApiResponse(
                success = true,
                data = mapOf("markedReadCount" to updatedCount),
                message = "All notifications marked as read"
            )
        )
    }
}
