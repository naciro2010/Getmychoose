package com.getmychoose.security

import com.getmychoose.entity.User
import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.Date
import javax.crypto.SecretKey

@Service
class JwtService(
    @Value("\${jwt.secret}")
    private val jwtSecret: String,

    @Value("\${jwt.expiration}")
    private val jwtExpiration: Long
) {
    private val secretKey: SecretKey by lazy {
        Keys.hmacShaKeyFor(jwtSecret.toByteArray())
    }

    fun generateToken(user: User): String {
        val now = Date()
        val expiry = Date(now.time + jwtExpiration)

        return Jwts.builder()
            .subject(user.id)
            .claim("email", user.email)
            .claim("role", user.role.name)
            .claim("name", user.name)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(secretKey)
            .compact()
    }

    fun validateToken(token: String): Boolean {
        return try {
            val claims = extractAllClaims(token)
            !isTokenExpired(claims)
        } catch (e: Exception) {
            false
        }
    }

    fun extractUserId(token: String): String {
        return extractAllClaims(token).subject
    }

    fun extractEmail(token: String): String {
        return extractAllClaims(token).get("email", String::class.java)
    }

    fun extractRole(token: String): String {
        return extractAllClaims(token).get("role", String::class.java)
    }

    private fun extractAllClaims(token: String): Claims {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .payload
    }

    private fun isTokenExpired(claims: Claims): Boolean {
        return claims.expiration.before(Date())
    }
}
