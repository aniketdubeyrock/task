package com.taskflow.controller

import com.taskflow.domain.User
import com.taskflow.dto.ApiResponse
import com.taskflow.dto.AuthResponse
import com.taskflow.dto.LoginRequest
import com.taskflow.dto.RegisterRequest
import com.taskflow.dto.UserDto
import com.taskflow.service.AuthService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
@Tag(name = "Authentication & Users", description = "User registration, authentication and member lookup")
class AuthController(
    private val authService: AuthService
) {

    @GetMapping("/health")
    @Operation(summary = "System health check")
    fun health(): ResponseEntity<ApiResponse<Map<String, String>>> {
        return ResponseEntity.ok(
            ApiResponse(
                success = true,
                data = mapOf(
                    "status" to "healthy",
                    "framework" to "Spring Boot 3.3.5 (Kotlin)",
                    "database" to "PostgreSQL (connected)"
                )
            )
        )
    }

    @PostMapping("/auth/register")
    @Operation(summary = "Register a new user account")
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<ApiResponse<AuthResponse>> {
        val authResponse = authService.register(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse(success = true, data = authResponse, message = "Registration successful")
        )
    }

    @PostMapping("/auth/login")
    @Operation(summary = "Authenticate user and obtain JWT token")
    fun login(
        @Valid @RequestBody request: LoginRequest,
        httpRequest: jakarta.servlet.http.HttpServletRequest
    ): ResponseEntity<ApiResponse<AuthResponse>> {
        val ipAddress = extractClientIp(httpRequest)
        val userAgent = httpRequest.getHeader("User-Agent") ?: "Unknown"
        val authResponse = authService.login(request, ipAddress, userAgent)
        return ResponseEntity.ok(
            ApiResponse(success = true, data = authResponse, message = "Login successful")
        )
    }

    private fun extractClientIp(request: jakarta.servlet.http.HttpServletRequest): String {
        val headers = listOf(
            "X-Forwarded-For",
            "X-Real-IP",
            "CF-Connecting-IP",
            "True-Client-IP"
        )
        for (header in headers) {
            val value = request.getHeader(header)
            if (!value.isNullOrBlank() && !value.equals("unknown", ignoreCase = true)) {
                return value.split(",")[0].trim()
            }
        }
        return request.remoteAddr ?: "Unknown"
    }

    @GetMapping("/auth/me")
    @Operation(summary = "Get current authenticated user profile")
    fun getProfile(@AuthenticationPrincipal user: User): ResponseEntity<ApiResponse<UserDto>> {
        val profile = authService.getProfile(user.email)
        return ResponseEntity.ok(ApiResponse(success = true, data = profile))
    }

    @PutMapping("/auth/profile")
    @Operation(summary = "Update current user profile")
    fun updateProfile(
        @AuthenticationPrincipal user: User,
        @Valid @RequestBody request: com.taskflow.dto.UpdateProfileRequest
    ): ResponseEntity<ApiResponse<UserDto>> {
        val updated = authService.updateProfile(user.email, request)
        return ResponseEntity.ok(
            ApiResponse(success = true, data = updated, message = "Profile updated successfully")
        )
    }

    @PostMapping("/auth/change-password")
    @Operation(summary = "Change authenticated user password")
    fun changePassword(
        @AuthenticationPrincipal user: User,
        @Valid @RequestBody request: com.taskflow.dto.ChangePasswordRequest
    ): ResponseEntity<ApiResponse<Map<String, String>>> {
        authService.changePassword(user.email, request)
        return ResponseEntity.ok(
            ApiResponse(
                success = true,
                data = mapOf("status" to "success"),
                message = "Password changed successfully"
            )
        )
    }

    @GetMapping("/users")
    @Operation(summary = "List all team members")
    fun listUsers(): ResponseEntity<ApiResponse<List<UserDto>>> {
        val users = authService.getAllUsers()
        return ResponseEntity.ok(ApiResponse(success = true, data = users))
    }
}
