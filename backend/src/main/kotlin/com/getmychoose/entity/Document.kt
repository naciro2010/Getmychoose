package com.getmychoose.entity

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.UUID

enum class DocumentType {
    ID_CARD,
    DRIVER_LICENSE,
    VEHICLE_REGISTRATION,
    INSURANCE,
    BUSINESS_LICENSE
}

enum class DocumentStatus {
    PENDING,
    APPROVED,
    REJECTED
}

@Entity
@Table(name = "documents")
data class Document(
    @Id
    val id: String = UUID.randomUUID().toString(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    val driver: Driver,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val type: DocumentType,

    @Column(nullable = false)
    val url: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: DocumentStatus = DocumentStatus.PENDING,

    @Column(columnDefinition = "TEXT")
    var rejectionReason: String? = null,

    @Column(nullable = false)
    val uploadedAt: LocalDateTime = LocalDateTime.now(),

    var verifiedAt: LocalDateTime? = null
)
