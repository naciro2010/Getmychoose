package com.getmychoose.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

enum class VehicleType {
    BICYCLE,
    SCOOTER,
    MOTORCYCLE,
    CAR,
    VAN
}

@Entity
@Table(name = "drivers")
data class Driver(
    @Id
    val id: String = UUID.randomUUID().toString(),

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    val user: User,

    var isOnline: Boolean = false,

    var isVerified: Boolean = false,

    var isActive: Boolean = true,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var vehicleType: VehicleType = VehicleType.CAR,

    var vehiclePlate: String? = null,

    var vehicleBrand: String? = null,

    var vehicleModel: String? = null,

    var vehicleColor: String? = null,

    // Banking info
    var iban: String? = null,

    var accountHolder: String? = null,

    // Statistics
    var totalDeliveries: Int = 0,

    @Column(precision = 3, scale = 2)
    var averageRating: BigDecimal = BigDecimal.ZERO,

    @Column(precision = 10, scale = 2)
    var earnings: BigDecimal = BigDecimal.ZERO,

    // Location tracking
    var latitude: Double? = null,

    var longitude: Double? = null,

    var lastLocationUpdate: LocalDateTime? = null,

    // Documents
    @OneToMany(mappedBy = "driver", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    val documents: MutableList<Document> = mutableListOf()
)
