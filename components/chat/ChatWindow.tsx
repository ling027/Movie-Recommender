"use client";
import { useEffect, useRef } from "react";
import { ChatMessage } from "@/types";
import MessageBubble from "./MessageBubble";
import styles from "./ChatWindow.module.css";

interface Props {
  messages: ChatMessage[];
  loading: boolean;
  userId: string;
  onFeedbackSubmit?: () => void;
}

export default function ChatWindow({ messages, loading, userId, onFeedbackSubmit }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className={styles.window}>
      {messages.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyEmoji}>🎬</div>
          <p className={styles.emptyText}>
            Tell me what kind of movie you&apos;re in the mood for and I&apos;ll find
            something perfect.
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          userId={userId}
          onFeedbackSubmit={onFeedbackSubmit}
        />
      ))}

      {loading && (
        <div className={styles.typingIndicator}>
          <div className={styles.dot} />
          <div className={styles.dot} />
          <div className={styles.dot} />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
