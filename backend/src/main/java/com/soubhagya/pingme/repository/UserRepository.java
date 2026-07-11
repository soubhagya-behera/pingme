package com.soubhagya.pingme.repository;

import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.UserRole;
import com.soubhagya.pingme.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    Optional<User> findByRole(UserRole role);

    boolean existsByEmail(String email);

    List<User> findByStatus(UserStatus status);

    long countByRole(UserRole role);

    long countByStatusAndRole(UserStatus status, UserRole role);

    long countByOnlineTrueAndRole(UserRole role);

}
