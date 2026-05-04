"use client";
import { MovieRecommendation } from "@/types";
import MovieCard from "./MovieCard";

interface Props {
  recommendations: MovieRecommendation[];
  userId: string;
  onFeedbackSubmit?: () => void;
}

export default function MovieGrid({ recommendations, userId, onFeedbackSubmit }: Props) {
  if (!recommendations.length) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        overflowX: "auto",
        padding: "16px 0 8px",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
      className="scrollbar-hide"
    >
      {recommendations.map((rec, i) => (
        <MovieCard
          key={`${rec.title}-${i}`}
          recommendation={rec}
          userId={userId}
          onFeedbackSubmit={onFeedbackSubmit}
        />
      ))}
    </div>
  );
}
