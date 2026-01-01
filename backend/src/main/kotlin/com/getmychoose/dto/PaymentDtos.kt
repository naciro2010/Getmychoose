package com.getmychoose.dto

import com.getmychoose.entity.PaymentStatus
import java.time.LocalDateTime

data class PaymentResponse(
    val id: String,
    val orderId: String,
    val amount: Double,
    val currency: String,
    val status: PaymentStatus,
    val stripePaymentIntentId: String?,
    val createdAt: LocalDateTime
)
