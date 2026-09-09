import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import DateSeparator from "./DateSeparator";
import { useAuth } from "../../../context/AuthContext";

const NEAR_BOTTOM_PX = 120;
const TOP_LOAD_THRESHOLD_PX = 100;
const HIGHLIGHT_DURATION_MS = 1800;

export default function ChatMessages({
  conversationId,
  historyLoaded,
  messages,
  loadingMore,
  hasMoreMessages,
  prependVersion,
  scrollToBottomRequest,
  onLoadMore,
  onReply,
  onEdit,
  onDelete,
  onDeleteMe,
  onForward,
  highlightQuery = "",
  searchActive = false,
  scrollToMessageId = null,
  scrollToMessageVersion = 0
}) {
  const { user } = useAuth();
  const containerRef = useRef(null);
  const conversationRef = useRef(null);
  const firstLoadRef = useRef(true);
  const previousScrollHeightRef = useRef(0);
  const previousScrollTopRef = useRef(0);
  const nearBottomRef = useRef(true);
  const lastPrependVersionRef = useRef(prependVersion);
  const lastScrollRequestRef = useRef(scrollToBottomRequest);
  const previousMessageCountRef = useRef(0);
  const loadRequestedRef = useRef(false);
  const pendingJumpRef = useRef(null);
  const lastJumpVersionRef = useRef(scrollToMessageVersion);
  const highlightTimerRef = useRef(null);
  const [highlightedId, setHighlightedId] = useState(null);

  useEffect(() => {
    return () => {
      clearTimeout(highlightTimerRef.current);
    };
  }, []);

  const isNearBottom = container =>
    container.scrollHeight - container.scrollTop - container.clientHeight <= NEAR_BOTTOM_PX;

  const scrollToBottom = behavior => {
    const container = containerRef.current;
    if (container) container.scrollTo({ top: container.scrollHeight, behavior });
    nearBottomRef.current = true;
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (conversationRef.current !== conversationId) {
      conversationRef.current = conversationId;
      firstLoadRef.current = true;
      previousMessageCountRef.current = 0;
      nearBottomRef.current = true;
      lastPrependVersionRef.current = prependVersion;
      lastScrollRequestRef.current = scrollToBottomRequest;
      pendingJumpRef.current = null;
      lastJumpVersionRef.current = scrollToMessageVersion;
      setHighlightedId(null);
    }

    // Register newly requested search jumps.
    if (scrollToMessageVersion !== lastJumpVersionRef.current) {
      lastJumpVersionRef.current = scrollToMessageVersion;
      pendingJumpRef.current = scrollToMessageId;
    }

    if (!historyLoaded) {
      previousScrollHeightRef.current = container.scrollHeight;
      previousScrollTopRef.current = container.scrollTop;
      return;
    }

    if (firstLoadRef.current) {
      scrollToBottom("auto");
      firstLoadRef.current = false;
    } else if (prependVersion !== lastPrependVersionRef.current) {
      // Preserve the exact visible content after older messages are prepended.
      container.scrollTop = previousScrollTopRef.current
        + (container.scrollHeight - previousScrollHeightRef.current);
      nearBottomRef.current = isNearBottom(container);
      lastPrependVersionRef.current = prependVersion;
    } else if (scrollToBottomRequest !== lastScrollRequestRef.current) {
      scrollToBottom("smooth");
      lastScrollRequestRef.current = scrollToBottomRequest;
    } else if (
      messages.length > previousMessageCountRef.current
      && nearBottomRef.current
      && !searchActive
    ) {
      // Incoming websocket messages only move the viewport when the reader is already at the bottom.
      scrollToBottom("smooth");
    }

    // Navigate to a searched message once it exists in the DOM.
    if (pendingJumpRef.current != null) {
      let target = null;
      try {
        target = container.querySelector(
          `[data-message-id="${CSS.escape(String(pendingJumpRef.current))}"]`
        );
      } catch {
        target = null;
      }
      if (target) {
        const jumpedId = pendingJumpRef.current;
        pendingJumpRef.current = null;
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedId(jumpedId);
        clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = setTimeout(
          () => setHighlightedId(null),
          HIGHLIGHT_DURATION_MS
        );
      }
      // Without a DOM match the jump stays pending until history loading brings the message in.
    }

    previousMessageCountRef.current = messages.length;
    previousScrollHeightRef.current = container.scrollHeight;
    previousScrollTopRef.current = container.scrollTop;
  }, [conversationId, historyLoaded, messages, prependVersion, scrollToBottomRequest, scrollToMessageId, scrollToMessageVersion, searchActive]);

  const handleScroll = event => {
    const container = event.currentTarget;
    nearBottomRef.current = isNearBottom(container);
    previousScrollHeightRef.current = container.scrollHeight;
    previousScrollTopRef.current = container.scrollTop;

    if (
      container.scrollTop > TOP_LOAD_THRESHOLD_PX
      || !hasMoreMessages
      || loadingMore
      || loadRequestedRef.current
    ) return;

    loadRequestedRef.current = true;
    Promise.resolve(onLoadMore?.()).finally(() => {
      loadRequestedRef.current = false;
    });
  };

  // Defensive filter: legacy soft-deleted rows (deletedForEveryone=true) must not render as placeholders
  const visibleMessages = messages.filter(m => !m.deletedForEveryone);
  return <section ref={containerRef} onScroll={handleScroll} className="chat-messages" aria-label="Messages">
    {loadingMore && <div className="chat-loading-more">Loading older messages...</div>}
    {visibleMessages.length === 0 ? <div className="chat-messages-empty"><span>Start your conversation 👋</span></div> : visibleMessages.map((message, index) => {
      const currentDate = new Date(message.sentAt).toDateString();
      const previousDate = index === 0 ? null : new Date(visibleMessages[index - 1].sentAt).toDateString();
      return <React.Fragment key={message.id}>
        {currentDate !== previousDate && <DateSeparator date={message.sentAt} />}
        <MessageBubble message={message} mine={message.senderId === user.id} text={message.content} time={message.sentAt} status={message.status}
          isHighlighted={highlightedId != null && message.id === highlightedId}
          highlightQuery={searchActive ? highlightQuery : ""}
          onReply={onReply} onEdit={onEdit} onDelete={onDelete} onDeleteMe={onDeleteMe} onForward={onForward} />
      </React.Fragment>;
    })}
  </section>;
}
