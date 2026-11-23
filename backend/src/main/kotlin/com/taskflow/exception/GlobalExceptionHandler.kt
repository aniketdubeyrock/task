package com.taskflow.exception

import com.taskflow.dto.ApiErrorDetail
import com.taskflow.dto.ApiResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationExceptions(ex: MethodArgumentNotValidException): ResponseEntity<ApiResponse<Nothing>> {
        val details = mutableMapOf<String, String>()
        for (error in ex.bindingResult.allErrors) {
            val fieldName = (error as? FieldError)?.field ?: "field"
            val errorMessage = error.defaultMessage ?: "Invalid value"
            details[fieldName] = errorMessage
        }

        val apiResponse = ApiResponse<Nothing>(
            success = false,
            error = ApiErrorDetail(
                message = "Validation failed",
                code = "VALIDATION_ERROR",
                details = details
            )
        )
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse)
    }

    @ExceptionHandler(BadRequestException::class)
    fun handleBadRequest(ex: BadRequestException): ResponseEntity<ApiResponse<Nothing>> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            ApiResponse(
                success = false,
                error = ApiErrorDetail(message = ex.message ?: "Bad request", code = "BAD_REQUEST")
            )
        )
    }

    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleNotFound(ex: ResourceNotFoundException): ResponseEntity<ApiResponse<Nothing>> {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
            ApiResponse(
                success = false,
                error = ApiErrorDetail(message = ex.message ?: "Resource not found", code = "NOT_FOUND")
            )
        )
    }

    @ExceptionHandler(ConflictException::class)
    fun handleConflict(ex: ConflictException): ResponseEntity<ApiResponse<Nothing>> {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
            ApiResponse(
                success = false,
                error = ApiErrorDetail(message = ex.message ?: "Resource conflict", code = "CONFLICT")
            )
        )
    }

    @ExceptionHandler(UnauthorizedException::class, BadCredentialsException::class)
    fun handleUnauthorized(ex: RuntimeException): ResponseEntity<ApiResponse<Nothing>> {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
            ApiResponse(
                success = false,
                error = ApiErrorDetail(message = ex.message ?: "Unauthorized", code = "UNAUTHORIZED")
            )
        )
    }

    @ExceptionHandler(ForbiddenException::class, AccessDeniedException::class)
    fun handleForbidden(ex: RuntimeException): ResponseEntity<ApiResponse<Nothing>> {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
            ApiResponse(
                success = false,
                error = ApiErrorDetail(message = ex.message ?: "Access denied", code = "FORBIDDEN")
            )
        )
    }

    @ExceptionHandler(Exception::class)
    fun handleGeneralException(ex: Exception): ResponseEntity<ApiResponse<Nothing>> {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
            ApiResponse(
                success = false,
                error = ApiErrorDetail(
                    message = ex.message ?: "An internal server error occurred",
                    code = "INTERNAL_SERVER_ERROR"
                )
            )
        )
    }
}
