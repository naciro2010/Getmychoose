package com.getmychoose.entity

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.UUID

enum class UserRole {
    CUSTOMER,
    DRIVER,
    ADMIN
}

@Entity
@Table(name = "users")
data class User(
    @Id
    val id: String = UUID.randomUUID().toString(),

    @Column(unique = true, nullable = false)
    val email: String,

    @Column(nullable = false)
    var password: String,

    @Column(nullable = false)
    var name: String,

    var phone: String? = null,

    var phoneVerified: Boolean = false,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var role: UserRole = UserRole.CUSTOMER,

    var avatar: String? = null,

    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    var updatedAt: LocalDateTime = LocalDateTime.now(),

    // Relations
    @OneToOne(mappedBy = "user", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    var driver: Driver? = null,

    @OneToMany(mappedBy = "customer", fetch = FetchType.LAZY)
    val ordersAsCustomer: MutableList<Order> = mutableListOf(),

    @OneToMany(mappedBy = "driver", fetch = FetchType.LAZY)
    val ordersAsDriver: MutableList<Order> = mutableListOf(),

    @OneToMany(mappedBy = "fromUser", fetch = FetchType.LAZY)
    val ratingsGiven: MutableList<Rating> = mutableListOf(),

    @OneToMany(mappedBy = "toUser", fetch = FetchType.LAZY)
    val ratingsReceived: MutableList<Rating> = mutableListOf()
) {
    @PreUpdate
    fun preUpdate() {
        updatedAt = LocalDateTime.now()
    }
}
