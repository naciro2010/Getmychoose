package com.getmychoose.repository

import com.getmychoose.entity.Rating
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface RatingRepository : JpaRepository<Rating, String> {
    fun findByOrderId(orderId: String): Optional<Rating>

    fun existsByOrderId(orderId: String): Boolean

    fun findByToUserId(userId: String): List<Rating>

    fun findByFromUserId(userId: String): List<Rating>

    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.toUser.id = :userId")
    fun getAverageRatingForUser(@Param("userId") userId: String): Double?

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.toUser.id = :userId")
    fun countRatingsForUser(@Param("userId") userId: String): Long
}
