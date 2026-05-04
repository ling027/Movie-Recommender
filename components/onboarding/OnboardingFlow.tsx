"use client";
import { useState } from "react";

const PROMPTS = [
  "I want something light and funny for the weekend",
  "A thriller that'll keep me on the edge of my seat",
  "Something beautiful and emotional, not too long",
  "A classic I might have missed from the 90s",
];

interface Props {
  onStart: (message: string) => void;
}

export default function OnboardingFlow({ onStart }: Props) {
  const [input, setInput] = useState("");

  function handleStart() {
    const text = input.trim();
    if (!text) return;
    onStart(text);
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        maxWidth: "600px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      <div style={{ fontSize: "64px", marginBottom: "24px" }}>🎬</div>
      <h1
        style={{
          fontSize: "28px",
          fontWeight: 800,
          margin: "0 0 12px",
          textAlign: "center",
          letterSpacing: "-0.5px",
        }}
      >
        What are you in the mood for?
      </h1>
      <p
        style={{
          color: "var(--muted)",
          fontSize: "15px",
          textAlign: "center",
          margin: "0 0 32px",
          maxWidth: "400px",
          lineHeight: "1.6",
        }}
      >
        Describe what you&apos;re looking for in your own words — I&apos;ll find movies
        that genuinely match your taste.
      </p>

      <div style={{ width: "100%", marginBottom: "20px" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleStart();
            }
          }}
          placeholder='e.g. "I want a thoughtful sci-fi, not too long, something I can watch alone tonight"'
          rows={3}
          style={{
            width: "100%",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            padding: "16px 18px",
            color: "var(--foreground)",
            fontSize: "15px",
            resize: "none",
            outline: "none",
            fontFamily: "inherit",
            lineHeight: "1.5",
            boxSizing: "border-box",
          }}
          autoFocus
        />
      </div>

      <button
        onClick={handleStart}
        disabled={!input.trim()}
        style={{
          background: "var(--accent)",
          color: "#fff",
          border: "none",
          borderRadius: "12px",
          padding: "14px 32px",
          fontSize: "16px",
          fontWeight: 700,
          cursor: input.trim() ? "pointer" : "not-allowed",
          opacity: input.trim() ? 1 : 0.5,
          marginBottom: "32px",
          width: "100%",
          maxWidth: "300px",
        }}
      >
        Find my movies →
      </button>

      <div style={{ width: "100%" }}>
        <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "12px", textAlign: "center" }}>
          Not sure? Try one of these:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => onStart(p)}
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "12px 16px",
                color: "var(--foreground)",
                fontSize: "14px",
                cursor: "pointer",
                textAlign: "left",
                transition: "border-color 0.15s",
              }}
            >
              &quot;{p}&quot;
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
