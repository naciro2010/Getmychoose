package com.getmychoose.dto

import com.getmychoose.entity.DocumentStatus
import com.getmychoose.entity.DocumentType
import java.time.LocalDateTime

// Document Upload Request (for multipart form)
data class DocumentUploadRequest(
    val type: DocumentType
)

// Document Response
data class DocumentResponse(
    val id: String,
    val driverId: String,
    val type: DocumentType,
    val url: String,
    val status: DocumentStatus,
    val rejectionReason: String?,
    val uploadedAt: LocalDateTime,
    val verifiedAt: LocalDateTime?
)

// Document with Driver info (for admin)
data class DocumentWithDriverResponse(
    val id: String,
    val type: DocumentType,
    val url: String,
    val status: DocumentStatus,
    val rejectionReason: String?,
    val uploadedAt: LocalDateTime,
    val verifiedAt: LocalDateTime?,
    val driver: DriverInfoResponse
)

data class DriverInfoResponse(
    val id: String,
    val userId: String,
    val userName: String,
    val userEmail: String,
    val userPhone: String?
)

data class DocumentListResponse(
    val documents: List<DocumentResponse>
)

data class AdminDocumentListResponse(
    val documents: List<DocumentWithDriverResponse>
)

// Update Document Request (admin action)
data class UpdateDocumentRequest(
    val action: String, // "approve" or "reject"
    val rejectionReason: String? = null
)

data class UpdateDocumentResponse(
    val message: String,
    val document: DocumentResponse
)
