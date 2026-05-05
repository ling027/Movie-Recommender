"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useChat } from "@/hooks/useChat";
import ChatWindow from "@/components/chat/ChatWindow";
import InputBar from "@/components/chat/InputBar";
import { ChatMessage, SessionSummary } from "@/types";

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

export default function ChatPage() {
  const [userId, setUserId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sentPending = useRef(false);

  // Init user + session on mount
  useEffect(() => {
    let uid = localStorage.getItem("userId");
    if (!uid) {
      uid = uuidv4();
      localStorage.setItem("userId", uid);
    }
    setUserId(uid);

    // Use session from sessionStorage, or create a new one
    let sid = sessionStorage.getItem("currentSessionId");
    if (!sid) {
      sid = uuidv4();
      sessionStorage.setItem("currentSessionId", sid);
    }
    setSessionId(sid);
  }, []);

  const fetchSessions = useCallback(async (uid: string) => {
    const res = await fetch(`/api/sessions?userId=${uid}`);
    if (res.ok) setSessions(await res.json());
  }, []);

  // Load sessions list
  useEffect(() => {
    if (!userId) return;
    fetchSessions(userId);
  }, [userId, fetchSessions]);

  // Load messages for current session
  useEffect(() => {
    if (!userId || !sessionId) return;
    fetch(`/api/messages?userId=${userId}&sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((msgs: ChatMessage[]) => setHistory(msgs))
      .catch(() => {});
  }, [userId, sessionId]);

  const { messages, loading, error, sendMessage } = useChat(userId, sessionId, history);

  // Send pending message from onboarding
  useEffect(() => {
    if (!userId || !sessionId || sentPending.current) return;
    const pending = sessionStorage.getItem("pendingMessage");
    if (pending) {
      sessionStorage.removeItem("pendingMessage");
      sentPending.current = true;
      sendMessage(pending);
    }
  }, [userId, sessionId, sendMessage]);

  // Refresh session list after a message is sent
  const prevCount = useRef(0);
  useEffect(() => {
    if (messages.length > prevCount.current && userId) {
      prevCount.current = messages.length;
      fetchSessions(userId);
    }
  }, [messages.length, userId, fetchSessions]);

  function startNewChat() {
    const sid = uuidv4();
    sessionStorage.setItem("currentSessionId", sid);
    sentPending.current = false;
    setHistory([]);
    setSessionId(sid);
  }

  function switchSession(sid: string) {
    if (sid === sessionId) return;
    sentPending.current = true; // prevent pending message from firing
    sessionStorage.setItem("currentSessionId", sid);
    setHistory([]);
    setSessionId(sid);
  }

  if (!userId || !sessionId) return null;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 56px)" }}>
      {/* Sidebar */}
      {sidebarOpen && (
        <div
          style={{
            width: "260px",
            flexShrink: 0,
            background: "var(--surface)",
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* New Chat button */}
          <div style={{ padding: "16px 12px 12px" }}>
            <button
              onClick={startNewChat}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid var(--accent)",
                background: "var(--accent)",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              + New Chat
            </button>
          </div>

          {/* Session list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 16px" }}>
            {sessions.length === 0 && (
              <p style={{ color: "var(--muted)", fontSize: "13px", padding: "8px 8px", margin: 0 }}>
                No conversations yet.
              </p>
            )}
            {sessions.map((s) => (
              <button
                key={s.sessionId}
                onClick={() => switchSession(s.sessionId)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: s.sessionId === sessionId ? "var(--surface-2)" : "transparent",
                  cursor: "pointer",
                  marginBottom: "2px",
                  transition: "background 0.15s",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--foreground)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginBottom: "3px",
                  }}
                >
                  {s.preview.length > 45 ? s.preview.slice(0, 45) + "…" : s.preview}
                </div>
                <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                  {formatDate(s.createdAt)} · {Math.floor(s.messageCount / 2)} exchanges
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar with toggle */}
        <div
          style={{
            padding: "8px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "var(--surface)",
          }}
        >
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "4px 8px",
              cursor: "pointer",
              color: "var(--muted)",
              fontSize: "16px",
              lineHeight: 1,
            }}
          >
            ☰
          </button>
          <span style={{ fontSize: "13px", color: "var(--muted)" }}>
            {sessions.find((s) => s.sessionId === sessionId)?.preview?.slice(0, 60) ?? "New conversation"}
          </span>
        </div>

        <ChatWindow messages={messages} loading={loading} userId={userId} />

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              color: "#dc2626",
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
    </div>
  );
}
