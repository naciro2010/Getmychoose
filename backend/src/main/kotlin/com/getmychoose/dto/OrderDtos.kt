package com.getmychoose.dto

import com.getmychoose.entity.OrderStatus
import com.getmychoose.entity.PackageType
import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

// Create Order Request
data class CreateOrderRequest(
    @field:NotBlank(message = "Pickup address is required")
    val pickupAddress: String,

    val pickupLat: Double? = null,
    val pickupLng: Double? = null,
    val pickupName: String? = null,
    val pickupPhone: String? = null,

    @field:NotBlank(message = "Delivery address is required")
    val deliveryAddress: String,

    val deliveryLat: Double? = null,
    val deliveryLng: Double? = null,
    val deliveryName: String? = null,
    val deliveryPhone: String? = null,
    val deliveryInstructions: String? = null,

    val packageType: PackageType = PackageType.SMALL,
    val packageWeight: Double? = null,
    val packageDescription: String? = null,
    val prohibitedItems: Boolean = false,

    val isScheduled: Boolean = false,
    val scheduledFor: LocalDateTime? = null,

    val isUrgent: Boolean = false,
    val distance: Double = 5.2 // Default mock distance
)

// Update Order Request
data class UpdateOrderRequest(
    val action: String, // "accept", "pickup", "deliver", "cancel"
    val cancellationReason: String? = null
)

// Order Response
data class OrderResponse(
    val id: String,
    val orderNumber: String,
    val customer: OrderUserResponse,
    val driver: OrderUserResponse?,
    val packageType: PackageType,
    val packageWeight: Double?,
    val packageDescription: String?,
    val prohibitedItems: Boolean,
    val pickupAddress: String,
    val pickupLat: Double?,
    val pickupLng: Double?,
    val pickupName: String?,
    val pickupPhone: String?,
    val deliveryAddress: String,
    val deliveryLat: Double?,
    val deliveryLng: Double?,
    val deliveryName: String?,
    val deliveryPhone: String?,
    val deliveryInstructions: String?,
    val isScheduled: Boolean,
    val scheduledFor: LocalDateTime?,
    val acceptedAt: LocalDateTime?,
    val pickedUpAt: LocalDateTime?,
    val deliveredAt: LocalDateTime?,
    val distance: Double,
    val basePrice: Double,
    val urgencyFee: Double,
    val totalPrice: Double,
    val driverEarnings: Double,
    val commission: Double,
    val status: OrderStatus,
    val qrCode: String?,
    val cancellationReason: String?,
    val createdAt: LocalDateTime,
    val payment: PaymentResponse?,
    val rating: RatingResponse?
)

data class OrderUserResponse(
    val id: String,
    val name: String,
    val email: String,
    val phone: String?,
    val avatar: String?
)

data class OrderListResponse(
    val orders: List<OrderResponse>
)

data class CreateOrderResponse(
    val message: String,
    val orderId: String
)

data class UpdateOrderResponse(
    val message: String,
    val order: OrderResponse
)
