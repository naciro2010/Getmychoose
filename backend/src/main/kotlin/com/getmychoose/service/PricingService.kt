package com.getmychoose.service

import com.getmychoose.entity.PackageType
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import kotlin.math.*

@Service
class PricingService {

    companion object {
        const val BASE_RATE_PER_KM = 1.50
        const val MINIMUM_PRICE = 5.0
        const val URGENCY_MARKUP = 0.30 // 30%
        const val PLATFORM_COMMISSION = 0.15 // 15%
        const val DRIVER_SHARE = 0.85 // 85%
        const val AVERAGE_SPEED_KMH = 30.0
    }

    fun getPackageMultiplier(packageType: PackageType): Double {
        return when (packageType) {
            PackageType.SMALL -> 1.0
            PackageType.MEDIUM -> 1.3
            PackageType.LARGE -> 1.6
            PackageType.EXTRA_LARGE -> 2.0
        }
    }

    fun calculateBasePrice(distance: Double, packageType: PackageType): BigDecimal {
        val multiplier = getPackageMultiplier(packageType)
        val calculated = distance * BASE_RATE_PER_KM * multiplier
        val price = maxOf(calculated, MINIMUM_PRICE)
        return BigDecimal.valueOf(price).setScale(2, RoundingMode.HALF_UP)
    }

    fun calculateUrgencyFee(basePrice: BigDecimal, isUrgent: Boolean): BigDecimal {
        if (!isUrgent) return BigDecimal.ZERO

        return (basePrice * BigDecimal.valueOf(URGENCY_MARKUP))
            .setScale(2, RoundingMode.HALF_UP)
    }

    fun calculateTotalPrice(basePrice: BigDecimal, urgencyFee: BigDecimal): BigDecimal {
        return (basePrice + urgencyFee).setScale(2, RoundingMode.HALF_UP)
    }

    fun calculateDriverEarnings(totalPrice: BigDecimal): BigDecimal {
        return (totalPrice * BigDecimal.valueOf(DRIVER_SHARE))
            .setScale(2, RoundingMode.HALF_UP)
    }

    fun calculateCommission(totalPrice: BigDecimal): BigDecimal {
        return (totalPrice * BigDecimal.valueOf(PLATFORM_COMMISSION))
            .setScale(2, RoundingMode.HALF_UP)
    }

    fun estimateDeliveryTimeMinutes(distanceKm: Double): Int {
        return ceil((distanceKm / AVERAGE_SPEED_KMH) * 60).toInt()
    }

    /**
     * Calculate distance between two points using Haversine formula
     */
    fun calculateDistance(
        lat1: Double, lng1: Double,
        lat2: Double, lng2: Double
    ): Double {
        val earthRadiusKm = 6371.0

        val dLat = Math.toRadians(lat2 - lat1)
        val dLng = Math.toRadians(lng2 - lng1)

        val a = sin(dLat / 2).pow(2) +
                cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) *
                sin(dLng / 2).pow(2)

        val c = 2 * atan2(sqrt(a), sqrt(1 - a))

        return earthRadiusKm * c
    }

    data class PricingResult(
        val basePrice: BigDecimal,
        val urgencyFee: BigDecimal,
        val totalPrice: BigDecimal,
        val driverEarnings: BigDecimal,
        val commission: BigDecimal,
        val estimatedMinutes: Int
    )

    fun calculateFullPricing(
        distance: Double,
        packageType: PackageType,
        isUrgent: Boolean
    ): PricingResult {
        val basePrice = calculateBasePrice(distance, packageType)
        val urgencyFee = calculateUrgencyFee(basePrice, isUrgent)
        val totalPrice = calculateTotalPrice(basePrice, urgencyFee)
        val driverEarnings = calculateDriverEarnings(totalPrice)
        val commission = calculateCommission(totalPrice)
        val estimatedMinutes = estimateDeliveryTimeMinutes(distance)

        return PricingResult(
            basePrice = basePrice,
            urgencyFee = urgencyFee,
            totalPrice = totalPrice,
            driverEarnings = driverEarnings,
            commission = commission,
            estimatedMinutes = estimatedMinutes
        )
    }
}
