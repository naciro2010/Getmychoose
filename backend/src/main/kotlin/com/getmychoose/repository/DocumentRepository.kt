package com.getmychoose.repository

import com.getmychoose.entity.Document
import com.getmychoose.entity.DocumentStatus
import com.getmychoose.entity.DocumentType
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DocumentRepository : JpaRepository<Document, String> {
    fun findByDriverIdOrderByUploadedAtDesc(driverId: String): List<Document>

    fun findByStatus(status: DocumentStatus, pageable: Pageable): List<Document>

    fun countByStatus(status: DocumentStatus): Long

    fun findByDriverIdAndType(driverId: String, type: DocumentType): Document?

    fun findByDriverIdAndStatus(driverId: String, status: DocumentStatus): List<Document>

    fun countByDriverIdAndStatus(driverId: String, status: DocumentStatus): Long
}
