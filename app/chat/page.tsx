"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useChat } from "@/hooks/useChat";
import ChatWindow from "@/components/chat/ChatWindow";
import InputBar from "@/components/chat/InputBar";
import { ChatMessage, SessionSummary } from "@/types";
import styles from "./chat.module.css";

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

  useEffect(() => {
    let uid = localStorage.getItem("userId");
    if (!uid) { uid = uuidv4(); localStorage.setItem("userId", uid); }
    setUserId(uid);

    let sid = sessionStorage.getItem("currentSessionId");
    if (!sid) { sid = uuidv4(); sessionStorage.setItem("currentSessionId", sid); }
    setSessionId(sid);
  }, []);

  const fetchSessions = useCallback(async (uid: string) => {
    const res = await fetch(`/api/sessions?userId=${uid}`);
    if (res.ok) setSessions(await res.json());
  }, []);

  useEffect(() => { if (userId) fetchSessions(userId); }, [userId, fetchSessions]);

  useEffect(() => {
    if (!userId || !sessionId) return;
    fetch(`/api/messages?userId=${userId}&sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((msgs: ChatMessage[]) => setHistory(msgs))
      .catch(() => {});
  }, [userId, sessionId]);

  const { messages, loading, error, sendMessage } = useChat(userId, sessionId, history);

  useEffect(() => {
    if (!userId || !sessionId || sentPending.current) return;
    const pending = sessionStorage.getItem("pendingMessage");
    if (pending) {
      sessionStorage.removeItem("pendingMessage");
      sentPending.current = true;
      sendMessage(pending);
    }
  }, [userId, sessionId, sendMessage]);

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
    sentPending.current = true;
    sessionStorage.setItem("currentSessionId", sid);
    setHistory([]);
    setSessionId(sid);
  }

  if (!userId || !sessionId) return null;

  const currentPreview = sessions.find((s) => s.sessionId === sessionId)?.preview?.slice(0, 60) ?? "New conversation";

  return (
    <div className={styles.page}>
      {sidebarOpen && (
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <button className={styles.newChatBtn} onClick={startNewChat}>+ New Chat</button>
          </div>
          <div className={styles.sessionList}>
            {sessions.length === 0 && (
              <p className={styles.emptySessionMsg}>No conversations yet.</p>
            )}
            {sessions.map((s) => (
              <button
                key={s.sessionId}
                onClick={() => switchSession(s.sessionId)}
                className={`${styles.sessionItem} ${s.sessionId === sessionId ? styles.sessionItemActive : ""}`}
              >
                <div className={styles.sessionPreview}>
                  {s.preview.length > 45 ? s.preview.slice(0, 45) + "…" : s.preview}
                </div>
                <div className={styles.sessionMeta}>
                  {formatDate(s.createdAt)} · {Math.floor(s.messageCount / 2)} exchanges
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.chatArea}>
        <div className={styles.topbar}>
          <button
            className={styles.toggleBtn}
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            ☰
          </button>
          <span className={styles.topbarTitle}>{currentPreview}</span>
        </div>

        <ChatWindow messages={messages} loading={loading} userId={userId} />

        {error && <div className={styles.error}>{error}</div>}

        <InputBar onSend={sendMessage} disabled={loading} />
      </div>
    </div>
  );
}
