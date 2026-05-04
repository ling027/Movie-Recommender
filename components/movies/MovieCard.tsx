"use client";
import { useState } from "react";
import Image from "next/image";
import { MovieRecommendation } from "@/types";
import { TMDB_IMAGE_BASE } from "@/lib/tmdb";
import FeedbackPanel from "./FeedbackPanel";

interface Props {
  recommendation: MovieRecommendation;
  userId: string;
  onFeedbackSubmit?: () => void;
}

export default function MovieCard({ recommendation, userId, onFeedbackSubmit }: Props) {
  const [showFeedback, setShowFeedback] = useState(false);
  const { tmdbData, title, year, reason } = recommendation;

  const posterUrl = tmdbData?.posterPath
    ? `${TMDB_IMAGE_BASE}${tmdbData.posterPath}`
    : null;

  const rating = tmdbData?.voteAverage
    ? tmdbData.voteAverage.toFixed(1)
    : null;

  const runtime = tmdbData?.runtime
    ? `${Math.floor(tmdbData.runtime / 60)}h ${tmdbData.runtime % 60}m`
    : null;

  const genres = tmdbData?.genres?.slice(0, 2).map((g) => g.name) ?? [];

  const initials = title
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        overflow: "hidden",
        width: "220px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.2s",
      }}
    >
      {/* Poster */}
      <div
        style={{
          width: "100%",
          height: "300px",
          background: "var(--surface)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title}
            fill
            style={{ objectFit: "cover" }}
            sizes="220px"
          />
        ) : (
          <div
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "var(--muted)",
              letterSpacing: "2px",
            }}
          >
            {initials}
          </div>
        )}
        {rating && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "rgba(249,115,22,0.9)",
              color: "#ffffff",
              borderRadius: "8px",
              padding: "4px 8px",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            ★ {rating}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "14px 14px 0", flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px", lineHeight: "1.3" }}>
          {title}
        </div>
        <div style={{ color: "var(--muted)", fontSize: "12px", marginBottom: "8px" }}>
          {year}{runtime ? ` · ${runtime}` : ""}
          {genres.length > 0 ? ` · ${genres.join(", ")}` : ""}
        </div>

        {/* Reason badge */}
        <div
          style={{
            background: "rgba(249, 115, 22, 0.08)",
            border: "1px solid rgba(249, 115, 22, 0.25)",
            borderRadius: "8px",
            padding: "8px 10px",
            fontSize: "12px",
            color: "#c05508",
            lineHeight: "1.4",
            marginBottom: "12px",
          }}
        >
          {reason}
        </div>

        {/* Director */}
        {tmdbData?.director && (
          <div style={{ color: "var(--muted)", fontSize: "11px", marginBottom: "10px" }}>
            Dir. {tmdbData.director}
          </div>
        )}
      </div>

      {/* Feedback button */}
      {!showFeedback && (
        <div style={{ padding: "0 14px 14px" }}>
          <button
            onClick={() => setShowFeedback(true)}
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--muted)",
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            Give Feedback
          </button>
        </div>
      )}

      {showFeedback && (
        <FeedbackPanel
          recommendation={recommendation}
          userId={userId}
          onClose={() => setShowFeedback(false)}
          onSubmit={() => {
            setShowFeedback(false);
            onFeedbackSubmit?.();
          }}
        />
      )}
    </div>
  );
}
