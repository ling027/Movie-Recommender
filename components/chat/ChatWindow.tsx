"use client";
import { useEffect, useRef } from "react";
import { ChatMessage } from "@/types";
import MessageBubble from "./MessageBubble";

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
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {messages.length === 0 && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            color: "var(--muted)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px" }}>🎬</div>
          <p style={{ fontSize: "16px", maxWidth: "320px", margin: 0 }}>
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
        <div style={{ display: "flex", gap: "6px", alignItems: "center", padding: "8px 0" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--muted)",
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
          <style>{`
            @keyframes bounce {
              0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
              40% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
