package com.getmychoose.controller

import com.getmychoose.dto.CreateRatingRequest
import com.getmychoose.dto.CreateRatingResponse
import com.getmychoose.security.CurrentUser
import com.getmychoose.service.RatingService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/ratings")
class RatingController(
    private val ratingService: RatingService,
    private val currentUser: CurrentUser
) {

    @PostMapping
    fun createRating(
        @Valid @RequestBody request: CreateRatingRequest
    ): ResponseEntity<CreateRatingResponse> {
        val userId = currentUser.getOrThrow().id
        val response = ratingService.createRating(request, userId)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }
}
