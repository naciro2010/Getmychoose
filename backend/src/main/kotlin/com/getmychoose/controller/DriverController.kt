package com.getmychoose.controller

import com.getmychoose.dto.*
import com.getmychoose.entity.DocumentType
import com.getmychoose.security.CurrentUser
import com.getmychoose.service.DocumentService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/driver")
@PreAuthorize("hasRole('DRIVER')")
class DriverController(
    private val documentService: DocumentService,
    private val currentUser: CurrentUser
) {

    @GetMapping("/documents")
    fun getDocuments(): ResponseEntity<DocumentListResponse> {
        val userId = currentUser.getOrThrow().id
        val response = documentService.getDriverDocuments(userId)
        return ResponseEntity.ok(response)
    }

    @PostMapping("/documents")
    fun uploadDocument(
        @RequestParam("type") type: DocumentType,
        @RequestParam("file") file: MultipartFile
    ): ResponseEntity<DocumentResponse> {
        val userId = currentUser.getOrThrow().id
        val response = documentService.uploadDocument(userId, type, file)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }
}
