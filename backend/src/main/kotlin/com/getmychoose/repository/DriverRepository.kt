package com.getmychoose.repository

import com.getmychoose.entity.Driver
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface DriverRepository : JpaRepository<Driver, String> {
    fun findByUserId(userId: String): Optional<Driver>

    fun countByIsVerifiedTrue(): Long

    @Query("SELECT d FROM Driver d ORDER BY d.totalDeliveries DESC")
    fun findTopDriversByDeliveries(pageable: Pageable): List<Driver>

    @Query("SELECT AVG(d.averageRating) FROM Driver d WHERE d.averageRating > 0")
    fun getAverageRating(): Double?

    fun findByIsOnlineTrue(): List<Driver>

    fun findByIsVerifiedTrue(): List<Driver>
}
