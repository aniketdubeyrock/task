package com.taskflow.service

import com.taskflow.config.JwtService
import com.taskflow.domain.Role
import com.taskflow.domain.User
import com.taskflow.dto.AuthResponse
import com.taskflow.dto.LoginRequest
import com.taskflow.dto.RegisterRequest
import com.taskflow.dto.UserDto
import com.taskflow.dto.toDto
import com.taskflow.exception.ConflictException
import com.taskflow.exception.ResourceNotFoundException
import com.taskflow.exception.UnauthorizedException
import com.taskflow.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AuthService(
    private val userRepository: UserRepository,
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

    @Transactional(readOnly = true)
    fun login(request: LoginRequest): AuthResponse {
        val user = userRepository.findByEmail(request.email.trim().lowercase())
            ?: throw UnauthorizedException("Invalid email or password")

        if (!passwordEncoder.matches(request.password, user.password)) {
            throw UnauthorizedException("Invalid email or password")
        }

        val token = jwtService.generateToken(user.email, user.role.name)
        return AuthResponse(user = user.toDto(), token = token)
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
