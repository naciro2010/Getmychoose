package com.getmychoose.service

import org.springframework.stereotype.Service
import java.time.Instant
import kotlin.random.Random

@Service
class OrderNumberService {

    fun generate(): String {
        val timestamp = Instant.now().toEpochMilli()
        val random = Random.nextInt(1000, 9999)
        return "GMC-$timestamp-$random"
    }
}
