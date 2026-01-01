package com.getmychoose.repository

import com.getmychoose.entity.Payment
import com.getmychoose.entity.PaymentStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface PaymentRepository : JpaRepository<Payment, String> {
    fun findByOrderId(orderId: String): Optional<Payment>

    fun findByStripePaymentIntentId(stripePaymentIntentId: String): Optional<Payment>

    fun countByStatus(status: PaymentStatus): Long
}
