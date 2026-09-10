package com.soubhagya.pingme.repository;

import com.soubhagya.pingme.entity.ClearedConversation;
import com.soubhagya.pingme.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClearedConversationRepository extends JpaRepository<ClearedConversation, Long> {

    Optional<ClearedConversation> findByUserAndPeer(User user, User peer);

    Optional<ClearedConversation> findByUserIdAndPeerId(Long userId, Long peerId);

    java.util.List<ClearedConversation> findByUser(User user);
}
