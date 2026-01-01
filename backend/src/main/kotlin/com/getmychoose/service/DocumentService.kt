package com.getmychoose.service

import com.getmychoose.dto.*
import com.getmychoose.entity.Document
import com.getmychoose.entity.DocumentStatus
import com.getmychoose.entity.DocumentType
import com.getmychoose.entity.UserRole
import com.getmychoose.exception.BadRequestException
import com.getmychoose.exception.ForbiddenException
import com.getmychoose.exception.ResourceNotFoundException
import com.getmychoose.repository.DocumentRepository
import com.getmychoose.repository.DriverRepository
import com.getmychoose.repository.UserRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDateTime
import java.util.UUID

@Service
class DocumentService(
    private val documentRepository: DocumentRepository,
    private val driverRepository: DriverRepository,
    private val userRepository: UserRepository
) {

    companion object {
        val REQUIRED_DOCUMENT_TYPES = listOf(
            DocumentType.ID_CARD,
            DocumentType.DRIVER_LICENSE,
            DocumentType.VEHICLE_REGISTRATION,
            DocumentType.INSURANCE
        )
    }

    fun getDriverDocuments(userId: String): DocumentListResponse {
        val driver = driverRepository.findByUserId(userId)
            .orElseThrow { ResourceNotFoundException("Driver profile not found") }

        val documents = documentRepository.findByDriverIdOrderByUploadedAtDesc(driver.id)

        return DocumentListResponse(
            documents = documents.map { toDocumentResponse(it) }
        )
    }

    @Transactional
    fun uploadDocument(
        userId: String,
        type: DocumentType,
        file: MultipartFile
    ): DocumentResponse {
        val driver = driverRepository.findByUserId(userId)
            .orElseThrow { ResourceNotFoundException("Driver profile not found") }

        // In production, upload to S3/Cloudinary
        // For now, create a mock URL
        val fileName = "${UUID.randomUUID()}_${file.originalFilename}"
        val mockUrl = "/uploads/documents/$fileName"

        // Check if document of this type already exists
        val existingDoc = documentRepository.findByDriverIdAndType(driver.id, type)
        if (existingDoc != null && existingDoc.status == DocumentStatus.APPROVED) {
            throw BadRequestException("An approved document of this type already exists")
        }

        // If there's a pending or rejected document, delete it
        existingDoc?.let {
            if (it.status != DocumentStatus.APPROVED) {
                documentRepository.delete(it)
            }
        }

        val document = Document(
            driver = driver,
            type = type,
            url = mockUrl,
            status = DocumentStatus.PENDING
        )

        val savedDocument = documentRepository.save(document)

        return toDocumentResponse(savedDocument)
    }

    fun getDocumentsForAdmin(status: DocumentStatus?): AdminDocumentListResponse {
        val pageable = PageRequest.of(0, 50)
        val documents = if (status != null) {
            documentRepository.findByStatus(status, pageable)
        } else {
            documentRepository.findByStatus(DocumentStatus.PENDING, pageable)
        }

        return AdminDocumentListResponse(
            documents = documents.map { toDocumentWithDriverResponse(it) }
        )
    }

    @Transactional
    fun updateDocumentStatus(
        documentId: String,
        request: UpdateDocumentRequest,
        adminUserId: String
    ): UpdateDocumentResponse {
        val admin = userRepository.findById(adminUserId)
            .orElseThrow { ResourceNotFoundException("Admin not found") }

        if (admin.role != UserRole.ADMIN) {
            throw ForbiddenException("Only admins can update document status")
        }

        val document = documentRepository.findById(documentId)
            .orElseThrow { ResourceNotFoundException("Document not found") }

        when (request.action.lowercase()) {
            "approve" -> {
                document.status = DocumentStatus.APPROVED
                document.verifiedAt = LocalDateTime.now()

                // Check if all required documents are approved
                checkAndUpdateDriverVerification(document.driver.id)
            }

            "reject" -> {
                if (request.rejectionReason.isNullOrBlank()) {
                    throw BadRequestException("Rejection reason is required")
                }
                document.status = DocumentStatus.REJECTED
                document.rejectionReason = request.rejectionReason
            }

            else -> throw BadRequestException("Invalid action: ${request.action}")
        }

        val savedDocument = documentRepository.save(document)

        return UpdateDocumentResponse(
            message = "Document ${request.action}d successfully",
            document = toDocumentResponse(savedDocument)
        )
    }

    private fun checkAndUpdateDriverVerification(driverId: String) {
        val driver = driverRepository.findById(driverId)
            .orElseThrow { ResourceNotFoundException("Driver not found") }

        val approvedTypes = documentRepository
            .findByDriverIdAndStatus(driverId, DocumentStatus.APPROVED)
            .map { it.type }

        val allRequiredApproved = REQUIRED_DOCUMENT_TYPES.all { it in approvedTypes }

        if (allRequiredApproved && !driver.isVerified) {
            driver.isVerified = true
            driverRepository.save(driver)
        }
    }

    private fun toDocumentResponse(document: Document): DocumentResponse {
        return DocumentResponse(
            id = document.id,
            driverId = document.driver.id,
            type = document.type,
            url = document.url,
            status = document.status,
            rejectionReason = document.rejectionReason,
            uploadedAt = document.uploadedAt,
            verifiedAt = document.verifiedAt
        )
    }

    private fun toDocumentWithDriverResponse(document: Document): DocumentWithDriverResponse {
        val driver = document.driver
        val user = driver.user

        return DocumentWithDriverResponse(
            id = document.id,
            type = document.type,
            url = document.url,
            status = document.status,
            rejectionReason = document.rejectionReason,
            uploadedAt = document.uploadedAt,
            verifiedAt = document.verifiedAt,
            driver = DriverInfoResponse(
                id = driver.id,
                userId = user.id,
                userName = user.name,
                userEmail = user.email,
                userPhone = user.phone
            )
        )
    }
}
