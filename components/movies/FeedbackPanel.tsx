"use client";
import { useState } from "react";
import { QuickTag, MovieRecommendation } from "@/types";

const TAGS: { id: QuickTag; label: string }[] = [
  { id: "loved_it", label: "❤️ Loved it" },
  { id: "already_seen", label: "✓ Already seen" },
  { id: "too_long", label: "⏱ Too long" },
  { id: "too_old", label: "📅 Too old" },
  { id: "not_my_genre", label: "🎭 Not my genre" },
  { id: "dislike_actor", label: "🙅 Dislike actor" },
  { id: "too_intense", label: "😰 Too intense" },
  { id: "too_slow", label: "🐌 Too slow" },
];

interface Props {
  recommendation: MovieRecommendation;
  userId: string;
  onClose: () => void;
  onSubmit: () => void;
}

export default function FeedbackPanel({ recommendation, userId, onClose, onSubmit }: Props) {
  const [selectedTags, setSelectedTags] = useState<QuickTag[]>([]);
  const [freeText, setFreeText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function toggleTag(tag: QuickTag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function deriveReaction(): "liked" | "not_interested" | "already_seen" {
    if (selectedTags.includes("loved_it")) return "liked";
    if (selectedTags.includes("already_seen")) return "already_seen";
    return "not_interested";
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          movieTitle: recommendation.title,
          tmdbId: recommendation.tmdbData?.id ?? null,
          reaction: deriveReaction(),
          quickTags: selectedTags,
          freeText,
        }),
      });
      setDone(true);
      onSubmit();
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div
        style={{
          padding: "16px",
          textAlign: "center",
          color: "var(--accent-hover)",
          fontSize: "13px",
        }}
      >
        ✓ Got it — we&apos;ll tune your recommendations.
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "16px",
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
        {TAGS.map((t) => (
          <button
            key={t.id}
            onClick={() => toggleTag(t.id)}
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              border: `1px solid ${selectedTags.includes(t.id) ? "var(--accent)" : "var(--border)"}`,
              background: selectedTags.includes(t.id)
                ? "rgba(249, 115, 22, 0.12)"
                : "transparent",
              color: selectedTags.includes(t.id) ? "var(--accent-hover)" : "var(--muted)",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <textarea
        value={freeText}
        onChange={(e) => setFreeText(e.target.value)}
        placeholder="Tell us more (optional)…"
        rows={2}
        style={{
          width: "100%",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "10px 12px",
          color: "var(--foreground)",
          fontSize: "13px",
          resize: "none",
          outline: "none",
          fontFamily: "inherit",
          marginBottom: "12px",
          boxSizing: "border-box",
        }}
      />
      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
        <button
          onClick={onClose}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--muted)",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || (selectedTags.length === 0 && !freeText.trim())}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            opacity: submitting || (selectedTags.length === 0 && !freeText.trim()) ? 0.5 : 1,
          }}
        >
          {submitting ? "Saving…" : "Submit"}
        </button>
      </div>
    </div>
  );
}
