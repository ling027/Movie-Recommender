"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage, MovieRecommendation } from "@/types";

export function useChat(
  userId: string,
  sessionId: string,
  initialMessages: ChatMessage[] = []
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const historyLoaded = useRef(false);

  // Reset when session changes
  useEffect(() => {
    historyLoaded.current = false;
    setMessages([]);
    setError(null);
  }, [sessionId]);

  // Load initial history once when it arrives for this session
  useEffect(() => {
    if (initialMessages.length > 0 && !historyLoaded.current) {
      historyLoaded.current = true;
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsgId = uuidv4();
      const userMsg: ChatMessage = {
        id: userMsgId,
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      setError(null);

      const history = messages;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            sessionId,
            userMessageId: userMsgId,
            message: text,
            history,
          }),
        });

        if (!res.ok) throw new Error("Request failed");

        const data = (await res.json()) as {
          reply: string;
          recommendations: MovieRecommendation[];
          assistantId: string;
        };

        const assistantMsg: ChatMessage = {
          id: data.assistantId,
          role: "assistant",
          content: data.reply,
          timestamp: new Date().toISOString(),
          recommendations: data.recommendations,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, userId, sessionId]
  );

  return { messages, setMessages, loading, error, sendMessage };
}
