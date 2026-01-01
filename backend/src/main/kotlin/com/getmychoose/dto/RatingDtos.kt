package com.getmychoose.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

// Create Rating Request
data class CreateRatingRequest(
    @field:NotBlank(message = "Order ID is required")
    val orderId: String,

    @field:Min(1, message = "Rating must be at least 1")
    @field:Max(5, message = "Rating must be at most 5")
    val rating: Int,

    val comment: String? = null
)

// Rating Response
data class RatingResponse(
    val id: String,
    val orderId: String,
    val fromUserId: String,
    val toUserId: String,
    val rating: Int,
    val comment: String?,
    val createdAt: LocalDateTime
)

data class CreateRatingResponse(
    val message: String,
    val rating: RatingResponse
)
