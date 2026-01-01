package com.getmychoose.service

import com.getmychoose.dto.CreateRatingRequest
import com.getmychoose.dto.CreateRatingResponse
import com.getmychoose.dto.RatingResponse
import com.getmychoose.entity.OrderStatus
import com.getmychoose.entity.Rating
import com.getmychoose.entity.UserRole
import com.getmychoose.exception.BadRequestException
import com.getmychoose.exception.ForbiddenException
import com.getmychoose.exception.ResourceNotFoundException
import com.getmychoose.repository.DriverRepository
import com.getmychoose.repository.OrderRepository
import com.getmychoose.repository.RatingRepository
import com.getmychoose.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode

@Service
class RatingService(
    private val ratingRepository: RatingRepository,
    private val orderRepository: OrderRepository,
    private val userRepository: UserRepository,
    private val driverRepository: DriverRepository
) {

    @Transactional
    fun createRating(request: CreateRatingRequest, userId: String): CreateRatingResponse {
        val order = orderRepository.findById(request.orderId)
            .orElseThrow { ResourceNotFoundException("Order not found") }

        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found") }

        // Validate order status
        if (order.status != OrderStatus.DELIVERED) {
            throw BadRequestException("Can only rate delivered orders")
        }

        // Check if already rated
        if (ratingRepository.existsByOrderId(order.id)) {
            throw BadRequestException("Order has already been rated")
        }

        // Validate rating value
        if (request.rating < 1 || request.rating > 5) {
            throw BadRequestException("Rating must be between 1 and 5")
        }

        // Determine who is rating whom
        val (fromUser, toUser) = when {
            order.customer.id == userId && order.driver != null -> {
                user to order.driver!!
            }
            order.driver?.id == userId -> {
                user to order.customer
            }
            else -> throw ForbiddenException("Only order participants can rate")
        }

        val rating = Rating(
            order = order,
            fromUser = fromUser,
            toUser = toUser,
            rating = request.rating,
            comment = request.comment
        )

        val savedRating = ratingRepository.save(rating)

        // Update driver's average rating if rated user is a driver
        if (toUser.role == UserRole.DRIVER) {
            updateDriverAverageRating(toUser.id)
        }

        return CreateRatingResponse(
            message = "Rating submitted successfully",
            rating = toRatingResponse(savedRating)
        )
    }

    private fun updateDriverAverageRating(userId: String) {
        val driver = driverRepository.findByUserId(userId).orElse(null) ?: return

        val averageRating = ratingRepository.getAverageRatingForUser(userId) ?: 0.0
        driver.averageRating = BigDecimal.valueOf(averageRating)
            .setScale(2, RoundingMode.HALF_UP)

        driverRepository.save(driver)
    }

    private fun toRatingResponse(rating: Rating): RatingResponse {
        return RatingResponse(
            id = rating.id,
            orderId = rating.order.id,
            fromUserId = rating.fromUser.id,
            toUserId = rating.toUser.id,
            rating = rating.rating,
            comment = rating.comment,
            createdAt = rating.createdAt
        )
    }
}
