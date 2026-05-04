"use client";
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage, MovieRecommendation } from "@/types";

export function useChat(userId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: ChatMessage = {
        id: uuidv4(),
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      setError(null);

      // Build history without the message we just added (server gets it separately)
      const history = messages;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, message: text, history }),
        });

        if (!res.ok) throw new Error("Request failed");

        const data = (await res.json()) as {
          reply: string;
          recommendations: MovieRecommendation[];
        };

        const assistantMsg: ChatMessage = {
          id: uuidv4(),
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
    [messages, loading, userId]
  );

  return { messages, loading, error, sendMessage };
}
