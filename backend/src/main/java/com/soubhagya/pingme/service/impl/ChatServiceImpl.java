package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.dto.chat.ChatMessage;
import com.soubhagya.pingme.dto.chat.MessageDeletedEvent;
import com.soubhagya.pingme.dto.chat.MessageEditedEvent;
import com.soubhagya.pingme.entity.HiddenMessage;
import com.soubhagya.pingme.entity.Message;
import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.enums.MessageStatus;
import com.soubhagya.pingme.enums.MessageType;
import com.soubhagya.pingme.repository.FriendRepository;
import com.soubhagya.pingme.repository.HiddenMessageRepository;
import com.soubhagya.pingme.repository.MessageRepository;
import com.soubhagya.pingme.repository.UserRepository;
import com.soubhagya.pingme.service.ChatService;
import com.soubhagya.pingme.service.AttachmentStorageService;
import com.soubhagya.pingme.service.ImageStorageService;
import com.soubhagya.pingme.service.NotificationService;
import com.soubhagya.pingme.service.ActiveChatTracker;
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


@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final FriendRepository friendRepository;
    private final HiddenMessageRepository hiddenMessageRepository;
    private final AttachmentStorageService attachmentStorageService;
    private final ImageStorageService imageStorageService;
    private final NotificationService notificationService;
    private final ActiveChatTracker activeChatTracker;

    @Override
    @Transactional
    public void sendMessage(ChatMessage request, String senderEmail) {
        User sender = userRepository.findByEmail(senderEmail).orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(request.getReceiverId()).orElseThrow(() -> new RuntimeException("Receiver not found"));
        if (sender.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException("You cannot send a message to yourself.");
        }
        if (!friendRepository.existsByUserOneAndUserTwoOrUserOneAndUserTwo(sender, receiver, receiver, sender)) {
            throw new RuntimeException("You can only chat with accepted friends.");
        }

        MessageType type;
        try {
            type = request.getMessageType() == null ? MessageType.TEXT : MessageType.valueOf(request.getMessageType());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Unsupported message type.");
        }

        String content = request.getContent() == null ? "" : request.getContent().trim();
        if (content.length() > 4000) throw new IllegalArgumentException("Message is too long.");
        boolean hasAttachment = request.getAttachmentUrl() != null && !request.getAttachmentUrl().isBlank();
        if (type == MessageType.TEXT && hasAttachment) {
            type = request.getAttachmentMimeType() != null && request.getAttachmentMimeType().startsWith("image/")
                    ? MessageType.IMAGE : MessageType.FILE;
        }
        if (type == MessageType.TEXT && content.isBlank()) throw new IllegalArgumentException("Message cannot be empty.");

        if (
                type != MessageType.TEXT
                &&
                (
                        request.getAttachmentUrl() == null
                                ||
                        request.getAttachmentUrl().isBlank()
                )
        ) {
            throw new RuntimeException(
                    "Attachment is required."
            );
        }
        if (type != MessageType.TEXT && !isManagedAttachment(request)) {
            throw new IllegalArgumentException("Invalid attachment URL.");
        }
        if (request.getAttachmentUrl() != null && request.getAttachmentUrl().startsWith("/uploads/chat-files/")) {
            validateGenericAttachmentMetadata(request);
        }

        Message.MessageBuilder builder =
                Message.builder()
                        .sender(sender)
                        .receiver(receiver)
                        .content(content)
                        .attachmentUrl(
                                request.getAttachmentUrl()
                        )
                        .attachmentName(
                                request.getAttachmentName()
                        )
                        .attachmentSize(
                                request.getAttachmentSize()
                        )
                        .attachmentMimeType(
                                request.getAttachmentMimeType()
                        )
                        .messageType(type)
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

        notifyReceiverAboutNewMessage(receiver, sender, saved);

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

        String updatedContent = content == null ? "" : content.trim();

        if (Boolean.TRUE.equals(message.getDeletedForEveryone())) {
            throw new IllegalArgumentException("Deleted messages cannot be edited.");
        }
        if (message.getAttachmentUrl() != null && updatedContent.length() > 4000) {
            throw new IllegalArgumentException("Caption is too long.");
        }
        if (message.getAttachmentUrl() != null && updatedContent.isBlank()) {
            // An empty caption is a valid edit for an image message.
            updatedContent = "";
        } else if (updatedContent.isBlank()) {
            throw new IllegalArgumentException("Message cannot be empty.");
        }
        if (java.util.Objects.equals(message.getContent(), updatedContent)) return;
        message.setContent(updatedContent);
        message.setEdited(true);
        message.setEditedAt(LocalDateTime.now());

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
                .orElseThrow(() -> new RuntimeException("Message not found"));

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

        String senderEmail = message.getSender().getEmail();
        String receiverEmail = message.getReceiver().getEmail();

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
                    .attachmentUrl(
                            message.getReplyTo()
                                   .getAttachmentUrl()
                    )
                    .attachmentMimeType(
                            message.getReplyTo()
                                   .getAttachmentMimeType()
                    )
                    .attachmentName(message.getReplyTo().getAttachmentName())
                    .attachmentSize(message.getReplyTo().getAttachmentSize())
                    .build();
        }

        return ChatMessage.builder()
                .id(message.getId())
                .clientId(clientId)
                .senderId(message.getSender().getId())
                .receiverId(message.getReceiver().getId())
                .content(message.getContent())
                .attachmentUrl(
                        message.getAttachmentUrl()
                )
                .attachmentName(
                        message.getAttachmentName()
                )
                .attachmentSize(
                        message.getAttachmentSize()
                )
                .attachmentMimeType(
                        message.getAttachmentMimeType()
                )
                .messageType(
                        message.getMessageType().name()
                )
                .sentAt(message.getSentAt())
                .status(message.getStatus().name())
                .reply(reply)
                .edited(message.getEdited())
                .editedAt(message.getEditedAt())
                .deletedForEveryone(message.getDeletedForEveryone())
                .deletedAt(message.getDeletedAt())
                .forwarded(message.getForwarded())
                .build();
    }

    private boolean isManagedAttachment(ChatMessage request) {
        String attachmentUrl = request.getAttachmentUrl();
        return attachmentStorageService.isManagedAttachment(
                attachmentUrl, request.getAttachmentSize(), request.getAttachmentMimeType())
                || imageStorageService.isManagedImage(attachmentUrl);
    }

    private void validateGenericAttachmentMetadata(ChatMessage request) {
        if (request.getAttachmentName() == null || request.getAttachmentName().isBlank()
                || request.getAttachmentName().length() > 255
                || request.getAttachmentName().contains("/") || request.getAttachmentName().contains("\\")
                || request.getAttachmentName().contains("..")
                || request.getAttachmentName().chars().anyMatch(Character::isISOControl)
                || request.getAttachmentSize() == null || request.getAttachmentSize() <= 0
                || request.getAttachmentMimeType() == null || request.getAttachmentMimeType().isBlank()) {
            throw new IllegalArgumentException("Attachment metadata is invalid.");
        }
    }

    private void notifyReceiverAboutNewMessage(User receiver, User sender, Message saved) {
        try {
            boolean receiverIsViewing =
                    activeChatTracker.isViewingChat(
                            receiver.getId(),
                            sender.getId()
                    );

            if (receiverIsViewing) {
                return;
            }

            notificationService.createMessageNotification(
                    receiver.getId(),
                    sender.getId(),
                    sender.getFullName(),
                    buildMessagePreview(saved)
            );
        } catch (Exception ignored) {
            // A notification failure must never break message delivery.
        }
    }

    private String buildMessagePreview(Message saved) {
        if (saved.getContent() != null && !saved.getContent().isBlank()) {
            String content = saved.getContent();
            return content.length() > 120 ? content.substring(0, 120) : content;
        }
        if (saved.getAttachmentMimeType() != null
                && saved.getAttachmentMimeType().startsWith("image/")) {
            return "sent you a photo";
        }
        if (saved.getAttachmentName() != null) {
            return "sent you a file";
        }
        return "sent you a message";
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

    @Override
    @Transactional
    public void deleteForMe(
            Long messageId,
            String email
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow();

        Message message =
                messageRepository.findById(messageId)
                        .orElseThrow();

        if (
                !message.getSender().getId().equals(user.getId())
                        &&
                !message.getReceiver().getId().equals(user.getId())
        ) {
            throw new RuntimeException(
                    "You cannot delete this message."
            );
        }

        if (
                hiddenMessageRepository.existsByMessageAndUser(
                        message,
                        user
                )
        ) {
            return;
        }

        HiddenMessage hiddenMessage =
                HiddenMessage.builder()
                        .message(message)
                        .user(user)
                        .hiddenAt(LocalDateTime.now())
                        .build();

        hiddenMessageRepository.save(hiddenMessage);
    }

    @Override
@Transactional
public void forwardMessage(
        Long messageId,
        Long receiverId,
        String email
) {

    User sender = userRepository.findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException("Sender not found")
            );

    User receiver = userRepository.findById(receiverId)
            .orElseThrow(() ->
                    new RuntimeException("Receiver not found")
            );

    
    if (sender.getId().equals(receiver.getId())) {

        throw new IllegalArgumentException(
                "You cannot forward a message to yourself."
        );
    }

    
    if (!friendRepository
            .existsByUserOneAndUserTwoOrUserOneAndUserTwo(
                    sender,
                    receiver,
                    receiver,
                    sender
            )) {

        throw new RuntimeException(
                "You can only forward messages to accepted friends."
        );
    }

    Message originalMessage =
            messageRepository.findById(messageId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Message not found"
                            )
                    );

    
    boolean belongsToConversation =

            originalMessage
                    .getSender()
                    .getId()
                    .equals(sender.getId())

            ||

            originalMessage
                    .getReceiver()
                    .getId()
                    .equals(sender.getId());

    if (!belongsToConversation) {

        throw new SecurityException(
                "You cannot forward this message."
        );
    }

    if (Boolean.TRUE.equals(
            originalMessage.getDeletedForEveryone()
    )) {

        throw new IllegalArgumentException(
                "Deleted messages cannot be forwarded."
        );
    }

    
    Message forwardedMessage =
            Message.builder()

                    .sender(sender)

                    .receiver(receiver)

                    .content(
                            originalMessage.getContent()
                    )

                    .attachmentUrl(
                            originalMessage.getAttachmentUrl()
                    )

                    .attachmentName(
                            originalMessage.getAttachmentName()
                    )

                    .attachmentSize(
                            originalMessage.getAttachmentSize()
                    )

                    .attachmentMimeType(
                            originalMessage.getAttachmentMimeType()
                    )

                    .messageType(
                            originalMessage.getMessageType()
                    )

                    .status(
                            MessageStatus.SENT
                    )

                    .sentAt(
                            LocalDateTime.now()
                    )

                    .forwarded(true)

                    .build();

    Message saved =
            messageRepository.save(
                    forwardedMessage
            );

    ChatMessage event =
            toEvent(
                    saved,
                    null
            );

    String senderEmailForDelivery =
            sender.getEmail();

    String receiverEmailForDelivery =
            receiver.getEmail();

    afterCommit(() -> {


        messagingTemplate.convertAndSendToUser(
                senderEmailForDelivery,
                "/queue/messages",
                event
        );

        messagingTemplate.convertAndSendToUser(
                receiverEmailForDelivery,
                "/queue/messages",
                event
        );

    });
}

@Override
    @Transactional(readOnly = true)
    public void setActiveConversation(
            Long friendId,
            String email
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        activeChatTracker.setActiveChat(user.getId(), friendId);
    }
}