package com.getmychoose.controller

import com.getmychoose.dto.*
import com.getmychoose.security.CurrentUser
import com.getmychoose.service.AuthService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService,
    private val currentUser: CurrentUser
) {

    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<RegisterResponse> {
        val response = authService.register(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<AuthResponse> {
        val response = authService.login(request)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/me")
    fun getCurrentUser(): ResponseEntity<UserResponse> {
        val user = currentUser.getOrThrow()
        val response = authService.toUserResponse(user)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/session")
    fun getSession(): ResponseEntity<Map<String, Any>> {
        val user = currentUser.get()
        return if (user != null) {
            ResponseEntity.ok(mapOf(
                "user" to authService.toUserResponse(user),
                "expires" to System.currentTimeMillis() + 86400000 // 24 hours
            ))
        } else {
            ResponseEntity.ok(mapOf("user" to null))
        }
    }
}
