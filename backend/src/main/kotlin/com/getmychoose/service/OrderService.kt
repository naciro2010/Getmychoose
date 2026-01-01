package com.getmychoose.service

import com.getmychoose.dto.*
import com.getmychoose.entity.*
import com.getmychoose.exception.BadRequestException
import com.getmychoose.exception.ForbiddenException
import com.getmychoose.exception.ResourceNotFoundException
import com.getmychoose.repository.*
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDateTime

@Service
class OrderService(
    private val orderRepository: OrderRepository,
    private val userRepository: UserRepository,
    private val driverRepository: DriverRepository,
    private val paymentRepository: PaymentRepository,
    private val pricingService: PricingService,
    private val orderNumberService: OrderNumberService,
    private val qrCodeService: QrCodeService
) {

    @Transactional
    fun createOrder(request: CreateOrderRequest, customerId: String): CreateOrderResponse {
        val customer = userRepository.findById(customerId)
            .orElseThrow { ResourceNotFoundException("Customer not found") }

        if (customer.role != UserRole.CUSTOMER && customer.role != UserRole.ADMIN) {
            throw ForbiddenException("Only customers can create orders")
        }

        // Calculate pricing
        val pricing = pricingService.calculateFullPricing(
            distance = request.distance,
            packageType = request.packageType,
            isUrgent = request.isUrgent
        )

        // Generate order number and QR code
        val orderNumber = orderNumberService.generate()
        val qrCode = qrCodeService.generateOrderQrCode(orderNumber)

        val order = Order(
            orderNumber = orderNumber,
            customer = customer,
            packageType = request.packageType,
            packageWeight = request.packageWeight,
            packageDescription = request.packageDescription,
            prohibitedItems = request.prohibitedItems,
            pickupAddress = request.pickupAddress,
            pickupLat = request.pickupLat,
            pickupLng = request.pickupLng,
            pickupName = request.pickupName,
            pickupPhone = request.pickupPhone,
            deliveryAddress = request.deliveryAddress,
            deliveryLat = request.deliveryLat,
            deliveryLng = request.deliveryLng,
            deliveryName = request.deliveryName,
            deliveryPhone = request.deliveryPhone,
            deliveryInstructions = request.deliveryInstructions,
            isScheduled = request.isScheduled,
            scheduledFor = request.scheduledFor,
            distance = BigDecimal.valueOf(request.distance),
            basePrice = pricing.basePrice,
            urgencyFee = pricing.urgencyFee,
            totalPrice = pricing.totalPrice,
            driverEarnings = pricing.driverEarnings,
            commission = pricing.commission,
            qrCode = qrCode
        )

        val savedOrder = orderRepository.save(order)

        return CreateOrderResponse(
            message = "Order created successfully",
            orderId = savedOrder.id
        )
    }

    fun getOrderById(orderId: String, userId: String): OrderResponse {
        val order = orderRepository.findById(orderId)
            .orElseThrow { ResourceNotFoundException("Order not found") }

        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found") }

        // Check access
        if (user.role != UserRole.ADMIN &&
            order.customer.id != userId &&
            order.driver?.id != userId) {
            throw ForbiddenException("Access denied to this order")
        }

        return toOrderResponse(order)
    }

    fun getOrdersForUser(userId: String): OrderListResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found") }

        val orders = when (user.role) {
            UserRole.CUSTOMER -> orderRepository.findByCustomerIdOrderByCreatedAtDesc(userId)
            UserRole.DRIVER -> orderRepository.findByDriverIdOrderByCreatedAtDesc(userId)
            UserRole.ADMIN -> orderRepository.findAll()
        }

        return OrderListResponse(orders.map { toOrderResponse(it) })
    }

    fun getAvailableOrders(): OrderListResponse {
        val orders = orderRepository.findByStatusAndDriverIsNull(
            OrderStatus.PENDING,
            PageRequest.of(0, 20)
        )
        return OrderListResponse(orders.map { toOrderResponse(it) })
    }

    @Transactional
    fun updateOrderStatus(
        orderId: String,
        request: UpdateOrderRequest,
        userId: String
    ): UpdateOrderResponse {
        val order = orderRepository.findById(orderId)
            .orElseThrow { ResourceNotFoundException("Order not found") }

        val user = userRepository.findById(userId)
            .orElseThrow { ResourceNotFoundException("User not found") }

        when (request.action.lowercase()) {
            "accept" -> {
                if (user.role != UserRole.DRIVER) {
                    throw ForbiddenException("Only drivers can accept orders")
                }
                if (order.status != OrderStatus.PENDING) {
                    throw BadRequestException("Order cannot be accepted in current status")
                }
                if (order.driver != null) {
                    throw BadRequestException("Order already accepted by another driver")
                }

                order.driver = user
                order.status = OrderStatus.ACCEPTED
                order.acceptedAt = LocalDateTime.now()
            }

            "pickup" -> {
                if (order.driver?.id != userId) {
                    throw ForbiddenException("Only the assigned driver can pickup")
                }
                if (order.status != OrderStatus.ACCEPTED) {
                    throw BadRequestException("Order must be accepted before pickup")
                }

                order.status = OrderStatus.PICKED_UP
                order.pickedUpAt = LocalDateTime.now()
            }

            "deliver" -> {
                if (order.driver?.id != userId) {
                    throw ForbiddenException("Only the assigned driver can deliver")
                }
                if (order.status != OrderStatus.PICKED_UP && order.status != OrderStatus.IN_TRANSIT) {
                    throw BadRequestException("Order must be picked up before delivery")
                }

                order.status = OrderStatus.DELIVERED
                order.deliveredAt = LocalDateTime.now()

                // Update driver stats
                val driver = driverRepository.findByUserId(userId)
                    .orElseThrow { ResourceNotFoundException("Driver profile not found") }
                driver.totalDeliveries += 1
                driver.earnings = driver.earnings.add(order.driverEarnings)
                driverRepository.save(driver)

                // Create payment record
                val payment = Payment(
                    order = order,
                    amount = order.totalPrice,
                    status = PaymentStatus.COMPLETED
                )
                paymentRepository.save(payment)
            }

            "cancel" -> {
                if (order.customer.id != userId && order.driver?.id != userId && user.role != UserRole.ADMIN) {
                    throw ForbiddenException("Only order participants or admin can cancel")
                }
                if (order.status == OrderStatus.DELIVERED || order.status == OrderStatus.CANCELLED) {
                    throw BadRequestException("Order cannot be cancelled in current status")
                }

                order.status = OrderStatus.CANCELLED
                order.cancellationReason = request.cancellationReason
            }

            else -> throw BadRequestException("Invalid action: ${request.action}")
        }

        val savedOrder = orderRepository.save(order)

        return UpdateOrderResponse(
            message = "Order updated successfully",
            order = toOrderResponse(savedOrder)
        )
    }

    fun toOrderResponse(order: Order): OrderResponse {
        return OrderResponse(
            id = order.id,
            orderNumber = order.orderNumber,
            customer = toOrderUserResponse(order.customer),
            driver = order.driver?.let { toOrderUserResponse(it) },
            packageType = order.packageType,
            packageWeight = order.packageWeight,
            packageDescription = order.packageDescription,
            prohibitedItems = order.prohibitedItems,
            pickupAddress = order.pickupAddress,
            pickupLat = order.pickupLat,
            pickupLng = order.pickupLng,
            pickupName = order.pickupName,
            pickupPhone = order.pickupPhone,
            deliveryAddress = order.deliveryAddress,
            deliveryLat = order.deliveryLat,
            deliveryLng = order.deliveryLng,
            deliveryName = order.deliveryName,
            deliveryPhone = order.deliveryPhone,
            deliveryInstructions = order.deliveryInstructions,
            isScheduled = order.isScheduled,
            scheduledFor = order.scheduledFor,
            acceptedAt = order.acceptedAt,
            pickedUpAt = order.pickedUpAt,
            deliveredAt = order.deliveredAt,
            distance = order.distance.toDouble(),
            basePrice = order.basePrice.toDouble(),
            urgencyFee = order.urgencyFee.toDouble(),
            totalPrice = order.totalPrice.toDouble(),
            driverEarnings = order.driverEarnings.toDouble(),
            commission = order.commission.toDouble(),
            status = order.status,
            qrCode = order.qrCode,
            cancellationReason = order.cancellationReason,
            createdAt = order.createdAt,
            payment = order.payment?.let { toPaymentResponse(it) },
            rating = order.rating?.let { toRatingResponse(it) }
        )
    }

    private fun toOrderUserResponse(user: User): OrderUserResponse {
        return OrderUserResponse(
            id = user.id,
            name = user.name,
            email = user.email,
            phone = user.phone,
            avatar = user.avatar
        )
    }

    private fun toPaymentResponse(payment: Payment): PaymentResponse {
        return PaymentResponse(
            id = payment.id,
            orderId = payment.order.id,
            amount = payment.amount.toDouble(),
            currency = payment.currency,
            status = payment.status,
            stripePaymentIntentId = payment.stripePaymentIntentId,
            createdAt = payment.createdAt
        )
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
