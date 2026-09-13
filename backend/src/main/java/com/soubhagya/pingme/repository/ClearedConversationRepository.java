package com.soubhagya.pingme.repository;

import com.soubhagya.pingme.entity.ClearedConversation;
import com.soubhagya.pingme.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ClearedConversationRepository extends JpaRepository<ClearedConversation, Long> {

    Optional<ClearedConversation> findByUserAndPeer(User user, User peer);

    Optional<ClearedConversation> findByUserIdAndPeerId(Long userId, Long peerId);

    java.util.List<ClearedConversation> findByUser(User user);

    void deleteByUser(User user);

    void deleteByPeer(User peer);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM ClearedConversation cc WHERE cc.user = :user OR cc.peer = :user")
    void deleteByUserOrPeer(@Param("user") User user);
}
