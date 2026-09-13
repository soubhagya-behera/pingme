-- V1: Initial schema representing current Hibernate entities
-- Supports fresh installs and, with baseline-on-migrate, existing installations that already have these tables.

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255),
    token_version BIGINT NOT NULL DEFAULT 0,
    profession VARCHAR(255),
    bio VARCHAR(255),
    phone VARCHAR(255),
    role VARCHAR(255),
    status VARCHAR(255),
    auth_provider VARCHAR(255),
    online BOOLEAN NOT NULL DEFAULT FALSE,
    must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_seen TIMESTAMP(6),
    created_at TIMESTAMP(6),
    updated_at TIMESTAMP(6)
);

CREATE TABLE IF NOT EXISTS friends (
    id BIGSERIAL PRIMARY KEY,
    user_one_id BIGINT NOT NULL REFERENCES users(id),
    user_two_id BIGINT NOT NULL REFERENCES users(id),
    friends_since TIMESTAMP(6),
    CONSTRAINT uk_friends_user_one_user_two UNIQUE (user_one_id, user_two_id)
);

CREATE TABLE IF NOT EXISTS friend_requests (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES users(id),
    receiver_id BIGINT NOT NULL REFERENCES users(id),
    status VARCHAR(255),
    created_at TIMESTAMP(6)
);

CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT REFERENCES users(id),
    receiver_id BIGINT REFERENCES users(id),
    reply_to_id BIGINT REFERENCES messages(id),
    content TEXT,
    image_url TEXT,
    attachment_name VARCHAR(255),
    attachment_size BIGINT,
    attachment_mime_type VARCHAR(255),
    attachment_duration BIGINT,
    message_type VARCHAR(255),
    status VARCHAR(255),
    sent_at TIMESTAMP(6),
    delivered_at TIMESTAMP(6),
    read_at TIMESTAMP(6),
    edited BOOLEAN NOT NULL DEFAULT FALSE,
    edited_at TIMESTAMP(6),
    deleted_for_everyone BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP(6),
    forwarded BOOLEAN NOT NULL DEFAULT FALSE,
    client_message_id VARCHAR(255),
    CONSTRAINT uk_messages_sender_client UNIQUE (sender_id, client_message_id)
);

CREATE TABLE IF NOT EXISTS message_hidden (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hidden_at TIMESTAMP(6)
);

CREATE TABLE IF NOT EXISTS cleared_conversations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    peer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cleared_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT uk_cleared_conversation UNIQUE (user_id, peer_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    recipient_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    message VARCHAR(255),
    related_user_id BIGINT,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP(6)
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    token_hash VARCHAR(255) UNIQUE,
    attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP(6),
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    expiry_date TIMESTAMP(6) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL
);
