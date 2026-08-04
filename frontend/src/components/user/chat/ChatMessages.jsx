import React, { useLayoutEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import DateSeparator from "./DateSeparator";
import { useAuth } from "../../../context/AuthContext";

export default function ChatMessages({ messages, onReply, onEdit, onDelete, onDeleteMe }) {
  const { user } = useAuth();
  const bottomRef = useRef(null);

  useLayoutEffect(() => {
    requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end"
        });
    });
  }, [messages]);

  return (
    <section className="chat-messages" aria-label="Messages">
      {messages.length === 0 ? (
        <div className="chat-messages-empty">
          <span>Start your conversation 👋</span>
        </div>
      ) : (
        messages.map((message, index) => {
          const currentDate = new Date(message.sentAt).toDateString();
          const previousDate =
            index === 0
              ? null
              : new Date(messages[index - 1].sentAt).toDateString();

          const showDate = currentDate !== previousDate;

          return (
            <React.Fragment key={message.id}>
              {showDate && <DateSeparator date={message.sentAt} />}
              <MessageBubble
                message={message}
                mine={message.senderId === user.id}
                text={message.content}
                time={message.sentAt}
                status={message.status}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onDeleteMe={onDeleteMe}
              />
            </React.Fragment>
          );
        })
      )}
      <div ref={bottomRef} />
    </section>
  );
}