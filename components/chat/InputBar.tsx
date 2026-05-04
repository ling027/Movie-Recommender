"use client";
import { useState, KeyboardEvent } from "react";

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function InputBar({ onSend, disabled, placeholder }: Props) {
  const [value, setValue] = useState("");

  function handleSend() {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        padding: "16px 20px",
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        alignItems: "flex-end",
      }}
    >
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder ?? "Tell me what you're in the mood for…"}
        disabled={disabled}
        rows={1}
        style={{
          flex: 1,
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "12px 16px",
          color: "var(--foreground)",
          fontSize: "15px",
          resize: "none",
          outline: "none",
          fontFamily: "inherit",
          lineHeight: "1.5",
          maxHeight: "120px",
          overflow: "auto",
          opacity: disabled ? 0.6 : 1,
        }}
        onInput={(e) => {
          const el = e.currentTarget;
          el.style.height = "auto";
          el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
        }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        style={{
          background: "var(--accent)",
          color: "#fff",
          border: "none",
          borderRadius: "12px",
          padding: "12px 20px",
          fontSize: "14px",
          fontWeight: 600,
          cursor: disabled || !value.trim() ? "not-allowed" : "pointer",
          opacity: disabled || !value.trim() ? 0.5 : 1,
          transition: "opacity 0.15s",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Send
      </button>
    </div>
  );
}
