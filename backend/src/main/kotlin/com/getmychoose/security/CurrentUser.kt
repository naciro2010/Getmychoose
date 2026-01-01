package com.getmychoose.security

import com.getmychoose.entity.User
import com.getmychoose.repository.UserRepository
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component

@Component
class CurrentUser(
    private val userRepository: UserRepository
) {
    fun get(): User? {
        val authentication = SecurityContextHolder.getContext().authentication
        if (authentication == null || !authentication.isAuthenticated) {
            return null
        }

        val principal = authentication.principal
        if (principal is org.springframework.security.core.userdetails.User) {
            return userRepository.findById(principal.username).orElse(null)
        }

        return null
    }

    fun getOrThrow(): User {
        return get() ?: throw RuntimeException("User not authenticated")
    }

    fun getId(): String? {
        val authentication = SecurityContextHolder.getContext().authentication
        if (authentication == null || !authentication.isAuthenticated) {
            return null
        }

        val principal = authentication.principal
        if (principal is org.springframework.security.core.userdetails.User) {
            return principal.username
        }

        return null
    }
}
