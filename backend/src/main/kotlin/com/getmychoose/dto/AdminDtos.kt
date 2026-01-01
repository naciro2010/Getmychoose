package com.getmychoose.dto

import com.getmychoose.entity.UserRole
import java.time.LocalDate

// Admin Stats Response
data class AdminStatsResponse(
    val overview: StatsOverview,
    val recentOrders: List<RecentOrderResponse>,
    val topDrivers: List<TopDriverResponse>,
    val revenueByDay: List<DayRevenue>
)

data class StatsOverview(
    val totalUsers: Long,
    val totalDrivers: Long,
    val totalCustomers: Long,
    val totalOrders: Long,
    val activeOrders: Long,
    val completedOrders: Long,
    val totalRevenue: Double,
    val commission: Double,
    val pendingDocuments: Long,
    val averageRating: Double,
    val conversionRate: Double
)

data class RecentOrderResponse(
    val id: String,
    val orderNumber: String,
    val customerName: String,
    val driverName: String?,
    val status: String,
    val totalPrice: Double,
    val createdAt: String
)

data class TopDriverResponse(
    val id: String,
    val name: String,
    val email: String,
    val totalDeliveries: Int,
    val averageRating: Double,
    val earnings: Double
)

data class DayRevenue(
    val date: LocalDate,
    val revenue: Double
)

// Admin Users Response
data class AdminUsersResponse(
    val users: List<AdminUserResponse>,
    val pagination: PaginationInfo
)

data class AdminUserResponse(
    val id: String,
    val email: String,
    val name: String,
    val phone: String?,
    val role: UserRole,
    val createdAt: String,
    val driver: DriverResponse?,
    val orderCount: Long
)

data class PaginationInfo(
    val page: Int,
    val limit: Int,
    val totalPages: Int,
    val totalItems: Long
)

// Admin Update User Request
data class AdminUpdateUserRequest(
    val action: String, // "update_role" or "toggle_active"
    val userId: String,
    val newRole: UserRole? = null
)
