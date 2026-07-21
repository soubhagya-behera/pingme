package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.dto.chat.ChatMessage;
import com.soubhagya.pingme.dto.chat.MessageDeletedEvent;
import com.soubhagya.pingme.dto.chat.MessageEditedEvent;
import com.soubhagya.pingme.entity.Message;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.MessageStatus;
import com.soubhagya.pingme.enums.MessageType;
import com.soubhagya.pingme.repository.FriendRepository;
import com.soubhagya.pingme.repository.MessageRepository;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.ChatService;
import com.soubhagya.pingme.websocket.MessageStatusUpdate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.soubhagya.pingme.dto.chat.TypingEvent;
import com.soubhagya.pingme.dto.chat.ReplyPreview;
import com.soubhagya.pingme.dto.chat.MessageDeletedEvent;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final FriendRepository friendRepository;

    @Override
    @Transactional
    public void sendMessage(ChatMessage request, String senderEmail) {
        User sender = userRepository.findByEmail(senderEmail).orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(request.getReceiverId()).orElseThrow(() -> new RuntimeException("Receiver not found"));
        if (!friendRepository.existsByUserOneAndUserTwoOrUserOneAndUserTwo(sender, receiver, receiver, sender)) {
            throw new RuntimeException("You can only chat with accepted friends.");
        }

        Message.MessageBuilder builder = Message.builder()
        .sender(sender)
        .receiver(receiver)
        .content(request.getContent())
        .messageType(MessageType.TEXT)
        .status(MessageStatus.SENT)
        .sentAt(LocalDateTime.now());

        if (request.getReplyToId() != null) {
            Message replyMessage = messageRepository.findById(request.getReplyToId())
                    .orElseThrow(() -> new RuntimeException("Reply message not found"));

            boolean validConversation =
                    (replyMessage.getSender().getId().equals(sender.getId())
                            && replyMessage.getReceiver().getId().equals(receiver.getId()))
                    ||
                    (replyMessage.getSender().getId().equals(receiver.getId())
                            && replyMessage.getReceiver().getId().equals(sender.getId()));

            if (!validConversation) {
                throw new RuntimeException("Invalid reply message.");
            }

            builder.replyTo(replyMessage);
        }

        Message saved = messageRepository.save(builder.build());
        ChatMessage event = toEvent(saved, request.getClientId());
        String senderEmailForDelivery = sender.getEmail();
        String receiverEmailForDelivery = receiver.getEmail();

        afterCommit(() -> {
            messagingTemplate.convertAndSendToUser(senderEmailForDelivery, "/queue/messages", event);
            messagingTemplate.convertAndSendToUser(receiverEmailForDelivery, "/queue/messages", event);
        });
    }

    private static final long EDIT_WINDOW_MINUTES = 15;
    private static final long DELETE_WINDOW_MINUTES = 15;

    @Override
    @Transactional
    public void editMessage(
            Long messageId,
            String content,
            String email
    ) {
        Message message = messageRepository.findByIdForEdit(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        // Only sender can edit
        if (!message.getSender().getEmail().equals(email)) {
            throw new SecurityException("You can only edit your own messages.");
        }

        // Validate edit time window
        if (message.getSentAt().isBefore(LocalDateTime.now().minusMinutes(EDIT_WINDOW_MINUTES))) {
            throw new RuntimeException("Edit time has expired.");
        }

        // Prevent empty messages
        String updatedContent = content == null ? "" : content.trim();

        if (updatedContent.isBlank()) {
            throw new RuntimeException("Message cannot be empty.");
        }

        if (updatedContent.length() > 4000) {
            throw new RuntimeException("Message is too long.");
        }

        if (message.getContent().equals(updatedContent)) {
            return;
        }

        // TODO:
        // Prevent editing deleted messages
        message.setContent(updatedContent);
        message.setEdited(true);
        message.setEditedAt(LocalDateTime.now());

        System.out.println("Message edited : " + message.getId());

        MessageEditedEvent event =
                MessageEditedEvent.builder()
                        .messageId(message.getId())
                        .content(message.getContent())
                        .edited(true)
                        .editedAt(message.getEditedAt())
                        .build();

        String senderEmail = message.getSender().getEmail();
        String receiverEmail = message.getReceiver().getEmail();

        afterCommit(() -> {
            messagingTemplate.convertAndSendToUser(
                    senderEmail,
                    "/queue/message-edited",
                    event
            );
            messagingTemplate.convertAndSendToUser(
                    receiverEmail,
                    "/queue/message-edited",
                    event
            );
        });
    }

    @Override
@Transactional
public void deleteForEveryone(

        Long messageId,

        String email

) {

    Message message = messageRepository.findByIdForEdit(messageId)

            .orElseThrow(() ->

                    new RuntimeException("Message not found"));

    // Only sender can delete

    if (!message.getSender().getEmail().equals(email)) {

        throw new SecurityException(

                "You can only delete your own messages."

        );

    }

    // Delete window

    if (

            message.getSentAt().isBefore(

                    LocalDateTime.now()

                            .minusMinutes(DELETE_WINDOW_MINUTES)

            )

    ) {

        throw new RuntimeException(

                "Delete time has expired."

        );

    }

    // Already deleted

    if (Boolean.TRUE.equals(message.getDeletedForEveryone())) {

        return;

    }

    message.setDeletedForEveryone(true);

    message.setDeletedAt(LocalDateTime.now());

    MessageDeletedEvent event =

            MessageDeletedEvent.builder()

                    .messageId(message.getId())

                    .deletedForEveryone(message.getDeletedForEveryone())

                    .deletedAt(message.getDeletedAt())

                    .build();

    String senderEmail =

            message.getSender().getEmail();

    String receiverEmail =

            message.getReceiver().getEmail();

    afterCommit(() -> {

        messagingTemplate.convertAndSendToUser(

                senderEmail,

                "/queue/message-deleted",

                event

        );

        messagingTemplate.convertAndSendToUser(

                receiverEmail,

                "/queue/message-deleted",

                event

        );

    });

}

    @Override
    @Transactional
    public void markAsDelivered(Long messageId, String receiverEmail) {
        Message message = messageRepository.findByIdForReceipt(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        if (!message.getReceiver().getEmail().equals(receiverEmail)) {
            throw new SecurityException("Only the recipient may acknowledge delivery");
        }
        if (message.getStatus() != MessageStatus.SENT) return;
        message.setStatus(MessageStatus.DELIVERED);
        message.setDeliveredAt(LocalDateTime.now());
        publishReceipt(message, MessageStatus.DELIVERED);
    }

    @Override
    @Transactional
    public void markAsRead(Long messageId, String receiverEmail) {
        Message message = messageRepository.findByIdForReceipt(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        if (!message.getReceiver().getEmail().equals(receiverEmail)) {
            throw new SecurityException("Only the recipient may acknowledge read");
        }
        if (message.getStatus() == MessageStatus.READ) return;
        if (message.getDeliveredAt() == null) message.setDeliveredAt(LocalDateTime.now());
        message.setStatus(MessageStatus.READ);
        message.setReadAt(LocalDateTime.now());
        publishReceipt(message, MessageStatus.READ);
    }

    @Override
    @Transactional
    public void markConversationAsRead(Long friendId, String receiverEmail) {
        User receiver = userRepository.findByEmail(receiverEmail).orElseThrow(() -> new RuntimeException("User not found"));
        User sender = userRepository.findById(friendId).orElseThrow(() -> new RuntimeException("Friend not found"));
        List<Message> unread = messageRepository.findBySenderAndReceiverAndStatus(sender, receiver, MessageStatus.DELIVERED);
        for (Message message : unread) {
            message.setStatus(MessageStatus.READ);
            message.setReadAt(LocalDateTime.now());
            publishReceipt(message, MessageStatus.READ);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public void replayUndeliveredMessages(String receiverEmail) {
        User receiver = userRepository.findByEmail(receiverEmail).orElseThrow(() -> new RuntimeException("User not found"));
        for (Message message : messageRepository.findByReceiverAndStatus(receiver, MessageStatus.SENT)) {
            messagingTemplate.convertAndSendToUser(receiverEmail, "/queue/messages", toEvent(message, null));
        }
    }

    @Override
    @Transactional(readOnly = true)
    public void sendTypingEvent(
            TypingEvent event,
            String senderEmail
    ) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        User receiver = userRepository.findById(event.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        boolean areFriends =
                friendRepository.existsByUserOneAndUserTwoOrUserOneAndUserTwo(
                        sender,
                        receiver,
                        receiver,
                        sender
                );

        if (!areFriends) {
            throw new RuntimeException("Typing not allowed.");
        }

        messagingTemplate.convertAndSendToUser(
                receiver.getEmail(),
                "/queue/typing",
                TypingEvent.builder()
                        .receiverId(sender.getId())
                        .typing(event.isTyping())
                        .build()
        );
    }

    private void publishReceipt(Message message, MessageStatus status) {
        MessageStatusUpdate event = MessageStatusUpdate.builder()
                .messageId(message.getId()).status(status.name()).build();
        String senderEmail = message.getSender().getEmail();
        afterCommit(() -> messagingTemplate.convertAndSendToUser(
                senderEmail, "/queue/receipts", event));
    }

    private ChatMessage toEvent(Message message, String clientId) {
        ReplyPreview reply = null;

        if (message.getReplyTo() != null) {
            reply = ReplyPreview.builder()
                    .id(message.getReplyTo().getId())
                    .senderId(message.getReplyTo().getSender().getId())
                    .content(message.getReplyTo().getContent())
                    .build();
        }

        return ChatMessage.builder()
                .id(message.getId())
                .clientId(clientId)
                .senderId(message.getSender().getId())
                .receiverId(message.getReceiver().getId())
                .content(message.getContent())
                .sentAt(message.getSentAt())
                .status(message.getStatus().name())
                .reply(reply)
                .edited(message.getEdited())
                .editedAt(message.getEditedAt())
                .deletedForEveryone(message.getDeletedForEveryone())
                .deletedAt(message.getDeletedAt())
                .build();
    }

    private void afterCommit(Runnable action) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            action.run();
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                action.run();
            }
        });
    }
}