package com.getmychoose.controller

import com.getmychoose.dto.*
import com.getmychoose.entity.DocumentStatus
import com.getmychoose.entity.UserRole
import com.getmychoose.security.CurrentUser
import com.getmychoose.service.AdminService
import com.getmychoose.service.DocumentService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
class AdminController(
    private val adminService: AdminService,
    private val documentService: DocumentService,
    private val currentUser: CurrentUser
) {

    @GetMapping("/stats")
    fun getStats(): ResponseEntity<AdminStatsResponse> {
        val response = adminService.getStats()
        return ResponseEntity.ok(response)
    }

    @GetMapping("/users")
    fun getUsers(
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "20") limit: Int,
        @RequestParam(required = false) role: UserRole?,
        @RequestParam(required = false) search: String?
    ): ResponseEntity<AdminUsersResponse> {
        val response = adminService.getUsers(page, limit, role, search)
        return ResponseEntity.ok(response)
    }

    @PatchMapping("/users")
    fun updateUser(
        @Valid @RequestBody request: AdminUpdateUserRequest
    ): ResponseEntity<Map<String, String>> {
        val message = adminService.updateUser(request)
        return ResponseEntity.ok(mapOf("message" to message))
    }

    @GetMapping("/documents")
    fun getDocuments(
        @RequestParam(required = false) status: DocumentStatus?
    ): ResponseEntity<AdminDocumentListResponse> {
        val response = documentService.getDocumentsForAdmin(status)
        return ResponseEntity.ok(response)
    }

    @PatchMapping("/documents/{id}")
    fun updateDocument(
        @PathVariable id: String,
        @Valid @RequestBody request: UpdateDocumentRequest
    ): ResponseEntity<UpdateDocumentResponse> {
        val userId = currentUser.getOrThrow().id
        val response = documentService.updateDocumentStatus(id, request, userId)
        return ResponseEntity.ok(response)
    }
}
