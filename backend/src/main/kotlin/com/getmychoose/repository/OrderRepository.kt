package com.getmychoose.repository

import com.getmychoose.entity.Order
import com.getmychoose.entity.OrderStatus
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.math.BigDecimal
import java.time.LocalDateTime

@Repository
interface OrderRepository : JpaRepository<Order, String> {
    fun findByCustomerIdOrderByCreatedAtDesc(customerId: String): List<Order>

    fun findByDriverIdOrderByCreatedAtDesc(driverId: String): List<Order>

    fun findByStatusAndDriverIsNull(status: OrderStatus, pageable: Pageable): List<Order>

    fun findByOrderNumber(orderNumber: String): Order?

    fun countByStatus(status: OrderStatus): Long

    fun countByStatusIn(statuses: List<OrderStatus>): Long

    @Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.status = :status")
    fun sumTotalPriceByStatus(@Param("status") status: OrderStatus): BigDecimal?

    @Query("SELECT SUM(o.commission) FROM Order o WHERE o.status = :status")
    fun sumCommissionByStatus(@Param("status") status: OrderStatus): BigDecimal?

    @Query("SELECT o FROM Order o ORDER BY o.createdAt DESC")
    fun findRecentOrders(pageable: Pageable): List<Order>

    @Query("SELECT DATE(o.createdAt), SUM(o.totalPrice) FROM Order o " +
           "WHERE o.status = 'DELIVERED' AND o.createdAt >= :startDate " +
           "GROUP BY DATE(o.createdAt) ORDER BY DATE(o.createdAt)")
    fun getRevenueByDay(@Param("startDate") startDate: LocalDateTime): List<Array<Any>>

    fun findByCustomerId(customerId: String): List<Order>

    fun findByDriverId(driverId: String): List<Order>

    fun countByCustomerId(customerId: String): Long

    fun countByDriverId(driverId: String): Long
}
