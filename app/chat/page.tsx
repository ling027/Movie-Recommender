"use client";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useChat } from "@/hooks/useChat";
import ChatWindow from "@/components/chat/ChatWindow";
import InputBar from "@/components/chat/InputBar";

export default function ChatPage() {
  const [userId, setUserId] = useState<string>("");
  const sentPending = useRef(false);

  useEffect(() => {
    let id = localStorage.getItem("userId");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("userId", id);
    }
    setUserId(id);
  }, []);

  const { messages, loading, error, sendMessage } = useChat(userId);

  // Send pending message from onboarding
  useEffect(() => {
    if (!userId || sentPending.current) return;
    const pending = sessionStorage.getItem("pendingMessage");
    if (pending) {
      sessionStorage.removeItem("pendingMessage");
      sentPending.current = true;
      sendMessage(pending);
    }
  }, [userId, sendMessage]);

  if (!userId) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 56px)",
      }}
    >
      <ChatWindow
        messages={messages}
        loading={loading}
        userId={userId}
      />
      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            color: "#f87171",
            padding: "8px 20px",
            fontSize: "13px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}
      <InputBar onSend={sendMessage} disabled={loading} />
    </div>
  );
}
