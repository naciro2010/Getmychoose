package com.getmychoose.dto

import com.getmychoose.entity.UserRole
import com.getmychoose.entity.VehicleType
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

// Register Request
data class RegisterRequest(
    @field:NotBlank(message = "Name is required")
    val name: String,

    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Invalid email format")
    val email: String,

    @field:NotBlank(message = "Password is required")
    @field:Size(min = 8, message = "Password must be at least 8 characters")
    val password: String,

    val phone: String? = null,

    val role: UserRole = UserRole.CUSTOMER,

    // Driver specific fields
    val vehicleType: VehicleType? = null
)

// Login Request
data class LoginRequest(
    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Invalid email format")
    val email: String,

    @field:NotBlank(message = "Password is required")
    val password: String
)

// Auth Response
data class AuthResponse(
    val token: String,
    val user: UserResponse
)

// Register Response
data class RegisterResponse(
    val message: String,
    val userId: String
)

// User Response (for session/profile)
data class UserResponse(
    val id: String,
    val email: String,
    val name: String,
    val phone: String?,
    val role: UserRole,
    val avatar: String?,
    val createdAt: String,
    val driver: DriverResponse? = null
)

// Driver Response
data class DriverResponse(
    val id: String,
    val isOnline: Boolean,
    val isVerified: Boolean,
    val isActive: Boolean,
    val vehicleType: VehicleType,
    val vehiclePlate: String?,
    val vehicleBrand: String?,
    val vehicleModel: String?,
    val vehicleColor: String?,
    val totalDeliveries: Int,
    val averageRating: Double,
    val earnings: Double
)
