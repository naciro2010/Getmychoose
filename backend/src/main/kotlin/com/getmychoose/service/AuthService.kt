package com.getmychoose.service

import com.getmychoose.dto.*
import com.getmychoose.entity.Driver
import com.getmychoose.entity.User
import com.getmychoose.entity.UserRole
import com.getmychoose.entity.VehicleType
import com.getmychoose.exception.BadRequestException
import com.getmychoose.exception.ConflictException
import com.getmychoose.exception.UnauthorizedException
import com.getmychoose.repository.DriverRepository
import com.getmychoose.repository.UserRepository
import com.getmychoose.security.JwtService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val driverRepository: DriverRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService
) {

    @Transactional
    fun register(request: RegisterRequest): RegisterResponse {
        // Check if email already exists
        if (userRepository.existsByEmail(request.email)) {
            throw ConflictException("Email already registered")
        }

        // Validate driver registration
        if (request.role == UserRole.DRIVER && request.vehicleType == null) {
            throw BadRequestException("Vehicle type is required for driver registration")
        }

        // Create user
        val user = User(
            email = request.email.lowercase().trim(),
            password = passwordEncoder.encode(request.password),
            name = request.name.trim(),
            phone = request.phone?.trim(),
            role = request.role
        )

        val savedUser = userRepository.save(user)

        // Create driver profile if needed
        if (request.role == UserRole.DRIVER) {
            val driver = Driver(
                user = savedUser,
                vehicleType = request.vehicleType ?: VehicleType.CAR
            )
            driverRepository.save(driver)
        }

        return RegisterResponse(
            message = "User registered successfully",
            userId = savedUser.id
        )
    }

    fun login(request: LoginRequest): AuthResponse {
        val user = userRepository.findByEmail(request.email.lowercase().trim())
            .orElseThrow { UnauthorizedException("Invalid email or password") }

        if (!passwordEncoder.matches(request.password, user.password)) {
            throw UnauthorizedException("Invalid email or password")
        }

        val token = jwtService.generateToken(user)

        return AuthResponse(
            token = token,
            user = toUserResponse(user)
        )
    }

    fun getUserById(userId: String): User? {
        return userRepository.findById(userId).orElse(null)
    }

    fun toUserResponse(user: User): UserResponse {
        val driver = if (user.role == UserRole.DRIVER) {
            driverRepository.findByUserId(user.id).orElse(null)
        } else null

        return UserResponse(
            id = user.id,
            email = user.email,
            name = user.name,
            phone = user.phone,
            role = user.role,
            avatar = user.avatar,
            createdAt = user.createdAt.toString(),
            driver = driver?.let { toDriverResponse(it) }
        )
    }

    fun toDriverResponse(driver: Driver): DriverResponse {
        return DriverResponse(
            id = driver.id,
            isOnline = driver.isOnline,
            isVerified = driver.isVerified,
            isActive = driver.isActive,
            vehicleType = driver.vehicleType,
            vehiclePlate = driver.vehiclePlate,
            vehicleBrand = driver.vehicleBrand,
            vehicleModel = driver.vehicleModel,
            vehicleColor = driver.vehicleColor,
            totalDeliveries = driver.totalDeliveries,
            averageRating = driver.averageRating.toDouble(),
            earnings = driver.earnings.toDouble()
        )
    }
}
