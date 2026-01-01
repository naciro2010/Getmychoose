package com.getmychoose.repository

import com.getmychoose.entity.User
import com.getmychoose.entity.UserRole
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface UserRepository : JpaRepository<User, String> {
    fun findByEmail(email: String): Optional<User>

    fun existsByEmail(email: String): Boolean

    fun findByRole(role: UserRole): List<User>

    fun countByRole(role: UserRole): Long

    @Query("SELECT u FROM User u WHERE " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    fun findByRoleAndSearch(
        @Param("role") role: UserRole?,
        @Param("search") search: String,
        pageable: Pageable
    ): Page<User>

    @Query("SELECT u FROM User u WHERE :role IS NULL OR u.role = :role")
    fun findByRoleOptional(
        @Param("role") role: UserRole?,
        pageable: Pageable
    ): Page<User>
}
