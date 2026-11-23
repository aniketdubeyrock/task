package com.taskflow.integration

import com.taskflow.dto.ApiResponse
import com.taskflow.dto.AuthResponse
import com.taskflow.dto.LoginRequest
import com.taskflow.dto.RegisterRequest
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.client.TestRestTemplate
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.*

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthAndProjectIntegrationTest {

    @Autowired
    private lateinit var restTemplate: TestRestTemplate

    @Test
    fun `health endpoint returns healthy status`() {
        val response = restTemplate.getForEntity("/api/health", String::class.java)
        assertEquals(HttpStatus.OK, response.statusCode)
        assertTrue(response.body!!.contains("healthy"))
    }

    @Test
    fun `seeded superadmin can login successfully`() {
        val loginReq = LoginRequest(
            email = "superadmin@taskflow.dev",
            password = "SuperAdmin123!"
        )

        val response = restTemplate.postForEntity(
            "/api/auth/login",
            loginReq,
            String::class.java
        )

        assertEquals(HttpStatus.OK, response.statusCode)
        assertTrue(response.body!!.contains("token"))
        assertTrue(response.body!!.contains("SUPERADMIN"))
    }

    @Test
    fun `user registration and login flow works end to end`() {
        val uniqueEmail = "integration_${System.currentTimeMillis()}@taskflow.dev"
        val registerReq = RegisterRequest(
            name = "Integration Test User",
            email = uniqueEmail,
            password = "Password123!"
        )

        // 1. Register
        val registerRes = restTemplate.postForEntity(
            "/api/auth/register",
            registerReq,
            String::class.java
        )
        assertEquals(HttpStatus.CREATED, registerRes.statusCode)
        assertTrue(registerRes.body!!.contains("token"))

        // 2. Login
        val loginReq = LoginRequest(email = uniqueEmail, password = "Password123!")
        val loginRes = restTemplate.postForEntity(
            "/api/auth/login",
            loginReq,
            String::class.java
        )
        assertEquals(HttpStatus.OK, loginRes.statusCode)
        assertTrue(loginRes.body!!.contains("token"))
    }
}
