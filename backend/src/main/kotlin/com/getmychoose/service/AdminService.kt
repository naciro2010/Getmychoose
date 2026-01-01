package com.getmychoose.service

import com.getmychoose.dto.*
import com.getmychoose.entity.DocumentStatus
import com.getmychoose.entity.OrderStatus
import com.getmychoose.entity.UserRole
import com.getmychoose.exception.BadRequestException
import com.getmychoose.exception.ResourceNotFoundException
import com.getmychoose.repository.*
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@Service
class AdminService(
    private val userRepository: UserRepository,
    private val driverRepository: DriverRepository,
    private val orderRepository: OrderRepository,
    private val documentRepository: DocumentRepository,
    private val authService: AuthService
) {

    fun getStats(): AdminStatsResponse {
        // Basic counts
        val totalUsers = userRepository.count()
        val totalDrivers = userRepository.countByRole(UserRole.DRIVER)
        val totalCustomers = totalUsers - totalDrivers - userRepository.countByRole(UserRole.ADMIN)
        val totalOrders = orderRepository.count()

        // Order statistics
        val activeStatuses = listOf(OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.PICKED_UP, OrderStatus.IN_TRANSIT)
        val activeOrders = orderRepository.countByStatusIn(activeStatuses)
        val completedOrders = orderRepository.countByStatus(OrderStatus.DELIVERED)

        // Revenue
        val totalRevenue = orderRepository.sumTotalPriceByStatus(OrderStatus.DELIVERED)
            ?: BigDecimal.ZERO
        val commission = orderRepository.sumCommissionByStatus(OrderStatus.DELIVERED)
            ?: BigDecimal.ZERO

        // Documents
        val pendingDocuments = documentRepository.countByStatus(DocumentStatus.PENDING)

        // Average rating
        val averageRating = driverRepository.getAverageRating() ?: 0.0

        // Conversion rate
        val conversionRate = if (totalOrders > 0) {
            (completedOrders.toDouble() / totalOrders.toDouble()) * 100
        } else 0.0

        // Recent orders
        val recentOrders = orderRepository.findRecentOrders(PageRequest.of(0, 10))
            .map { order ->
                RecentOrderResponse(
                    id = order.id,
                    orderNumber = order.orderNumber,
                    customerName = order.customer.name,
                    driverName = order.driver?.name,
                    status = order.status.name,
                    totalPrice = order.totalPrice.toDouble(),
                    createdAt = order.createdAt.toString()
                )
            }

        // Top drivers
        val topDrivers = driverRepository.findTopDriversByDeliveries(PageRequest.of(0, 5))
            .map { driver ->
                TopDriverResponse(
                    id = driver.id,
                    name = driver.user.name,
                    email = driver.user.email,
                    totalDeliveries = driver.totalDeliveries,
                    averageRating = driver.averageRating.toDouble(),
                    earnings = driver.earnings.toDouble()
                )
            }

        // Revenue by day (last 30 days)
        val thirtyDaysAgo = LocalDateTime.now().minusDays(30)
        val revenueByDayRaw = orderRepository.getRevenueByDay(thirtyDaysAgo)
        val revenueByDay = revenueByDayRaw.map { row ->
            val date = when (val dateVal = row[0]) {
                is java.sql.Date -> dateVal.toLocalDate()
                is LocalDate -> dateVal
                else -> LocalDate.parse(dateVal.toString())
            }
            val revenue = when (val revenueVal = row[1]) {
                is BigDecimal -> revenueVal.toDouble()
                is Number -> revenueVal.toDouble()
                else -> 0.0
            }
            DayRevenue(date = date, revenue = revenue)
        }

        return AdminStatsResponse(
            overview = StatsOverview(
                totalUsers = totalUsers,
                totalDrivers = totalDrivers,
                totalCustomers = totalCustomers,
                totalOrders = totalOrders,
                activeOrders = activeOrders,
                completedOrders = completedOrders,
                totalRevenue = totalRevenue.toDouble(),
                commission = commission.toDouble(),
                pendingDocuments = pendingDocuments,
                averageRating = averageRating,
                conversionRate = conversionRate
            ),
            recentOrders = recentOrders,
            topDrivers = topDrivers,
            revenueByDay = revenueByDay
        )
    }

    fun getUsers(
        page: Int,
        limit: Int,
        role: UserRole?,
        search: String?
    ): AdminUsersResponse {
        val pageable = PageRequest.of(page - 1, limit)

        val usersPage = if (!search.isNullOrBlank()) {
            userRepository.findByRoleAndSearch(role, search, pageable)
        } else {
            userRepository.findByRoleOptional(role, pageable)
        }

        val users = usersPage.content.map { user ->
            val orderCount = when (user.role) {
                UserRole.CUSTOMER -> orderRepository.countByCustomerId(user.id)
                UserRole.DRIVER -> orderRepository.countByDriverId(user.id)
                else -> 0L
            }

            AdminUserResponse(
                id = user.id,
                email = user.email,
                name = user.name,
                phone = user.phone,
                role = user.role,
                createdAt = user.createdAt.toString(),
                driver = if (user.role == UserRole.DRIVER) {
                    driverRepository.findByUserId(user.id).orElse(null)?.let {
                        authService.toDriverResponse(it)
                    }
                } else null,
                orderCount = orderCount
            )
        }

        return AdminUsersResponse(
            users = users,
            pagination = PaginationInfo(
                page = page,
                limit = limit,
                totalPages = usersPage.totalPages,
                totalItems = usersPage.totalElements
            )
        )
    }

    @Transactional
    fun updateUser(request: AdminUpdateUserRequest): String {
        val user = userRepository.findById(request.userId)
            .orElseThrow { ResourceNotFoundException("User not found") }

        when (request.action.lowercase()) {
            "update_role" -> {
                if (request.newRole == null) {
                    throw BadRequestException("New role is required")
                }
                user.role = request.newRole
                userRepository.save(user)
                return "User role updated successfully"
            }

            "toggle_active" -> {
                val driver = driverRepository.findByUserId(user.id)
                    .orElseThrow { BadRequestException("User is not a driver") }
                driver.isActive = !driver.isActive
                driverRepository.save(driver)
                return "Driver active status toggled"
            }

            else -> throw BadRequestException("Invalid action: ${request.action}")
        }
    }
}
