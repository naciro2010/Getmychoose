package com.getmychoose.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

enum class PaymentStatus {
    PENDING,
    COMPLETED,
    FAILED,
    REFUNDED
}

@Entity
@Table(name = "payments")
data class Payment(
    @Id
    val id: String = UUID.randomUUID().toString(),

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", unique = true, nullable = false)
    val order: Order,

    @Column(precision = 10, scale = 2, nullable = false)
    val amount: BigDecimal,

    @Column(nullable = false)
    val currency: String = "EUR",

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: PaymentStatus = PaymentStatus.PENDING,

    // Stripe integration
    @Column(unique = true)
    var stripePaymentIntentId: String? = null,

    var stripeChargeId: String? = null,

    // Refund info
    @Column(precision = 10, scale = 2)
    var refundAmount: BigDecimal? = null,

    var refundedAt: LocalDateTime? = null,

    @Column(columnDefinition = "TEXT")
    var refundReason: String? = null,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    var updatedAt: LocalDateTime = LocalDateTime.now()
) {
    @PreUpdate
    fun preUpdate() {
        updatedAt = LocalDateTime.now()
    }
}
