"use client";
import { MovieRecommendation } from "@/types";
import MovieCard from "./MovieCard";
import styles from "./MovieGrid.module.css";

interface Props {
  recommendations: MovieRecommendation[];
  userId: string;
  onFeedbackSubmit?: () => void;
}

export default function MovieGrid({ recommendations, userId, onFeedbackSubmit }: Props) {
  if (!recommendations.length) return null;

  return (
    <div className={styles.grid}>
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
