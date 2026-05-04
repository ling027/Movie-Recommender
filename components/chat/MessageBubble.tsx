"use client";
import ReactMarkdown from "react-markdown";
import { ChatMessage } from "@/types";
import MovieGrid from "@/components/movies/MovieGrid";

interface Props {
  message: ChatMessage;
  userId: string;
  onFeedbackSubmit?: () => void;
}

export default function MessageBubble({ message, userId, onFeedbackSubmit }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <div
          style={{
            background: "var(--accent)",
            color: "#fff",
            borderRadius: "18px 18px 4px 18px",
            padding: "12px 16px",
            maxWidth: "70%",
            fontSize: "15px",
            lineHeight: "1.5",
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "24px" }}>
      <div
        style={{
          background: "var(--surface-2)",
          borderRadius: "4px 18px 18px 18px",
          padding: "14px 18px",
          maxWidth: "85%",
          fontSize: "15px",
          lineHeight: "1.7",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
        }}
      >
        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p style={{ margin: "0 0 8px 0" }}>{children}</p>
            ),
            strong: ({ children }) => (
              <strong style={{ color: "var(--accent-hover)" }}>{children}</strong>
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>

      {message.recommendations && message.recommendations.length > 0 && (
        <MovieGrid
          recommendations={message.recommendations}
          userId={userId}
          onFeedbackSubmit={onFeedbackSubmit}
        />
      )}
    </div>
  );
}
