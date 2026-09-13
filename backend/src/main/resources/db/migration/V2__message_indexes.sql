-- V2: Indexes for hot query paths (F-DB02)
-- Only indexes matching real repository queries; no blind extras.

-- Hot: receiver_id + status (findByReceiverAndStatus, findBySenderAndReceiverAndStatus, countByReceiverAndStatus, markConversationAsRead)
CREATE INDEX IF NOT EXISTS idx_messages_receiver_status ON messages (receiver_id, status);

-- Hot: sender/receiver + sent_at for conversation paging (getConversation, getConversationAfter, searchConversation)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_sent_at ON messages (sender_id, receiver_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_sender_sent_at ON messages (receiver_id, sender_id, sent_at);

-- Hot: general sent_at ordering for recent sidebar queries
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages (sent_at);

-- Hot: client_message_id for idempotency lookup (existsBySenderAndClientMessageId / sync)
CREATE INDEX IF NOT EXISTS idx_messages_client_message_id ON messages (client_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_client ON messages (sender_id, client_message_id);

-- Hot: attachment cleanup lookup
CREATE INDEX IF NOT EXISTS idx_messages_attachment_url ON messages (attachment_url);

-- Supporting indexes for other hot paths (friends / friend_requests)
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests (status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender_receiver ON friend_requests (sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_friends_user_one ON friends (user_one_id);
CREATE INDEX IF NOT EXISTS idx_friends_user_two ON friends (user_two_id);
