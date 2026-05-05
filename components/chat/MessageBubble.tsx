"use client";
import ReactMarkdown from "react-markdown";
import { ChatMessage } from "@/types";
import MovieGrid from "@/components/movies/MovieGrid";
import styles from "./MessageBubble.module.css";

interface Props {
  message: ChatMessage;
  userId: string;
  onFeedbackSubmit?: () => void;
}

export default function MessageBubble({ message, userId, onFeedbackSubmit }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className={styles.userRow}>
        <div className={styles.userBubble}>{message.content}</div>
      </div>
    );
  }

  return (
    <div className={styles.assistantRow}>
      <div className={styles.assistantBubble}>
        <ReactMarkdown>{message.content}</ReactMarkdown>
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
