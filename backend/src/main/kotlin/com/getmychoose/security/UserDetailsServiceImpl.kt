package com.getmychoose.security

import com.getmychoose.repository.UserRepository
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service

@Service
class UserDetailsServiceImpl(
    private val userRepository: UserRepository
) : UserDetailsService {

    override fun loadUserByUsername(email: String): UserDetails {
        val user = userRepository.findByEmail(email)
            .orElseThrow { UsernameNotFoundException("User not found with email: $email") }

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.id)
            .password(user.password)
            .authorities(listOf(SimpleGrantedAuthority("ROLE_${user.role.name}")))
            .build()
    }

    fun loadUserById(id: String): UserDetails {
        val user = userRepository.findById(id)
            .orElseThrow { UsernameNotFoundException("User not found with id: $id") }

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.id)
            .password(user.password)
            .authorities(listOf(SimpleGrantedAuthority("ROLE_${user.role.name}")))
            .build()
    }
}
