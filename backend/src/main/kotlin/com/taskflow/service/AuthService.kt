package com.taskflow.service

import com.taskflow.config.JwtService
import com.taskflow.domain.Role
import com.taskflow.domain.User
import com.taskflow.domain.UserLoginLog
import com.taskflow.dto.AuthResponse
import com.taskflow.dto.LoginRequest
import com.taskflow.dto.RegisterRequest
import com.taskflow.dto.UserDto
import com.taskflow.dto.toDto
import com.taskflow.exception.ConflictException
import com.taskflow.exception.ResourceNotFoundException
import com.taskflow.exception.UnauthorizedException
import com.taskflow.repository.UserLoginLogRepository
import com.taskflow.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val userLoginLogRepository: UserLoginLogRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService
) {

    @Transactional
    fun register(request: RegisterRequest): AuthResponse {
        if (userRepository.existsByEmail(request.email)) {
            throw ConflictException("User with email '${request.email}' already exists")
        }

        val user = userRepository.save(
            User(
                name = request.name.trim(),
                email = request.email.trim().lowercase(),
                password = passwordEncoder.encode(request.password),
                role = Role.USER
            )
        )

        val token = jwtService.generateToken(user.email, user.role.name)
        return AuthResponse(user = user.toDto(), token = token)
    }

    fun login(
        request: LoginRequest,
        ipAddress: String = "127.0.0.1",
        userAgent: String? = null
    ): AuthResponse {
        val email = request.email.trim().lowercase()
        val user = userRepository.findByEmail(email)

        if (user == null || !passwordEncoder.matches(request.password, user.password)) {
            recordLoginLog(
                userId = user?.id,
                email = email,
                ipAddress = ipAddress,
                userAgent = userAgent,
                status = "FAILED"
            )
            throw UnauthorizedException("Invalid email or password")
        }

        recordLoginLog(
            userId = user.id,
            email = email,
            ipAddress = ipAddress,
            userAgent = userAgent,
            status = "SUCCESS"
        )

        val token = jwtService.generateToken(user.email, user.role.name)
        return AuthResponse(user = user.toDto(), token = token)
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    fun recordLoginLog(
        userId: UUID?,
        email: String,
        ipAddress: String,
        userAgent: String?,
        status: String
    ) {
        try {
            val (browser, os) = parseUserAgent(userAgent)
            userLoginLogRepository.save(
                UserLoginLog(
                    userId = userId,
                    email = email,
                    ipAddress = ipAddress,
                    userAgent = userAgent,
                    browser = browser,
                    os = os,
                    status = status
                )
            )
        } catch (_: Exception) {
            // Security/audit logging should never fail the user request
        }
    }

    private fun parseUserAgent(userAgent: String?): Pair<String, String> {
        if (userAgent.isNullOrBlank()) return Pair("Unknown", "Unknown")

        val browser = when {
            userAgent.contains("Edg", ignoreCase = true) -> "Edge"
            userAgent.contains("OPR", ignoreCase = true) || userAgent.contains("Opera", ignoreCase = true) -> "Opera"
            userAgent.contains("Chrome", ignoreCase = true) -> "Chrome"
            userAgent.contains("Firefox", ignoreCase = true) -> "Firefox"
            userAgent.contains("Safari", ignoreCase = true) -> "Safari"
            userAgent.contains("PostmanRuntime", ignoreCase = true) -> "Postman"
            userAgent.contains("curl", ignoreCase = true) -> "cURL"
            else -> "Other"
        }

        val os = when {
            userAgent.contains("Windows", ignoreCase = true) -> "Windows"
            userAgent.contains("Macintosh", ignoreCase = true) || userAgent.contains("Mac OS", ignoreCase = true) -> "macOS"
            userAgent.contains("Android", ignoreCase = true) -> "Android"
            userAgent.contains("iPhone", ignoreCase = true) || userAgent.contains("iPad", ignoreCase = true) || userAgent.contains("iOS", ignoreCase = true) -> "iOS"
            userAgent.contains("Linux", ignoreCase = true) -> "Linux"
            else -> "Other"
        }

        return Pair(browser, os)
    }

    @Transactional(readOnly = true)
    fun getProfile(email: String): UserDto {
        val user = userRepository.findByEmail(email)
            ?: throw ResourceNotFoundException("User not found")
        return user.toDto()
    }

    @Transactional
    fun updateProfile(email: String, request: com.taskflow.dto.UpdateProfileRequest): UserDto {
        val user = userRepository.findByEmail(email)
            ?: throw ResourceNotFoundException("User not found")
        user.name = request.name.trim()
        val updated = userRepository.save(user)
        return updated.toDto()
    }

    @Transactional
    fun changePassword(email: String, request: com.taskflow.dto.ChangePasswordRequest) {
        val user = userRepository.findByEmail(email)
            ?: throw ResourceNotFoundException("User not found")

        if (!passwordEncoder.matches(request.currentPassword, user.password)) {
            throw UnauthorizedException("Current password is incorrect")
        }

        user.password = passwordEncoder.encode(request.newPassword)
        userRepository.save(user)
    }

    @Transactional(readOnly = true)
    fun getAllUsers(): List<UserDto> {
        return userRepository.findAll().map { it.toDto() }
    }
}
