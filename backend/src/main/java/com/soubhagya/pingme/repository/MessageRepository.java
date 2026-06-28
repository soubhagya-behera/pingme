package com.soubhagya.pingme.repository;

import com.soubhagya.pingme.entity.Message;
import com.soubhagya.pingme.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository
        extends JpaRepository<Message, Long> {

    List<Message> findBySenderAndReceiverOrderBySentAtAsc(
            User sender,
            User receiver
    );

}