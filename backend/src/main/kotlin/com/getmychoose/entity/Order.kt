package com.getmychoose.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

enum class OrderStatus {
    PENDING,
    ACCEPTED,
    PICKED_UP,
    IN_TRANSIT,
    DELIVERED,
    CANCELLED,
    REFUNDED
}

enum class PackageType {
    SMALL,      // 1.0x multiplier
    MEDIUM,     // 1.3x multiplier
    LARGE,      // 1.6x multiplier
    EXTRA_LARGE // 2.0x multiplier
}

@Entity
@Table(name = "orders")
data class Order(
    @Id
    val id: String = UUID.randomUUID().toString(),

    @Column(unique = true, nullable = false)
    val orderNumber: String,

    // Customer relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    val customer: User,

    // Driver relationship (nullable until accepted)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    var driver: User? = null,

    // Package details
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val packageType: PackageType = PackageType.SMALL,

    var packageWeight: Double? = null,

    var packageDescription: String? = null,

    var prohibitedItems: Boolean = false,

    // Pickup location
    @Column(nullable = false)
    val pickupAddress: String,

    var pickupLat: Double? = null,

    var pickupLng: Double? = null,

    var pickupName: String? = null,

    var pickupPhone: String? = null,

    // Delivery location
    @Column(nullable = false)
    val deliveryAddress: String,

    var deliveryLat: Double? = null,

    var deliveryLng: Double? = null,

    var deliveryName: String? = null,

    var deliveryPhone: String? = null,

    @Column(columnDefinition = "TEXT")
    var deliveryInstructions: String? = null,

    // Timing
    var isScheduled: Boolean = false,

    var scheduledFor: LocalDateTime? = null,

    var acceptedAt: LocalDateTime? = null,

    var pickedUpAt: LocalDateTime? = null,

    var deliveredAt: LocalDateTime? = null,

    // Pricing
    @Column(precision = 10, scale = 2)
    val distance: BigDecimal = BigDecimal.ZERO,

    @Column(precision = 10, scale = 2, nullable = false)
    val basePrice: BigDecimal,

    @Column(precision = 10, scale = 2)
    val urgencyFee: BigDecimal = BigDecimal.ZERO,

    @Column(precision = 10, scale = 2, nullable = false)
    val totalPrice: BigDecimal,

    @Column(precision = 10, scale = 2, nullable = false)
    val driverEarnings: BigDecimal,

    @Column(precision = 10, scale = 2, nullable = false)
    val commission: BigDecimal,

    // Status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: OrderStatus = OrderStatus.PENDING,

    @Column(unique = true)
    val qrCode: String? = null,

    @Column(columnDefinition = "TEXT")
    var cancellationReason: String? = null,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    var updatedAt: LocalDateTime = LocalDateTime.now(),

    // Relations
    @OneToOne(mappedBy = "order", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var payment: Payment? = null,

    @OneToOne(mappedBy = "order", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var rating: Rating? = null
) {
    @PreUpdate
    fun preUpdate() {
        updatedAt = LocalDateTime.now()
    }
}
