package com.getmychoose.controller

import com.getmychoose.dto.*
import com.getmychoose.security.CurrentUser
import com.getmychoose.service.OrderService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/orders")
class OrderController(
    private val orderService: OrderService,
    private val currentUser: CurrentUser
) {

    @PostMapping
    fun createOrder(
        @Valid @RequestBody request: CreateOrderRequest
    ): ResponseEntity<CreateOrderResponse> {
        val userId = currentUser.getOrThrow().id
        val response = orderService.createOrder(request, userId)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @GetMapping
    fun getOrders(): ResponseEntity<OrderListResponse> {
        val userId = currentUser.getOrThrow().id
        val response = orderService.getOrdersForUser(userId)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/{id}")
    fun getOrder(@PathVariable id: String): ResponseEntity<OrderResponse> {
        val userId = currentUser.getOrThrow().id
        val response = orderService.getOrderById(id, userId)
        return ResponseEntity.ok(response)
    }

    @PatchMapping("/{id}")
    fun updateOrder(
        @PathVariable id: String,
        @Valid @RequestBody request: UpdateOrderRequest
    ): ResponseEntity<UpdateOrderResponse> {
        val userId = currentUser.getOrThrow().id
        val response = orderService.updateOrderStatus(id, request, userId)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/available")
    fun getAvailableOrders(): ResponseEntity<OrderListResponse> {
        val response = orderService.getAvailableOrders()
        return ResponseEntity.ok(response)
    }
}
