"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { MovieRecommendation, TMDBMovie } from "@/types";
import { TMDB_IMAGE_BASE } from "@/lib/tmdb";
import FeedbackPanel from "./FeedbackPanel";
import styles from "./MovieCard.module.css";

interface Props {
  recommendation: MovieRecommendation;
  userId: string;
  onFeedbackSubmit?: () => void;
}

export default function MovieCard({ recommendation, userId, onFeedbackSubmit }: Props) {
  const [showFeedback, setShowFeedback] = useState(false);
  const { title, year, reason } = recommendation;
  const [tmdbData, setTmdbData] = useState<TMDBMovie | null | undefined>(recommendation.tmdbData);

  useEffect(() => {
    if (tmdbData !== null && tmdbData !== undefined) return;
    const params = new URLSearchParams({ title });
    if (year) params.set("year", String(year));
    fetch(`/api/movies?${params}`)
      .then((r) => r.json())
      .then((data: TMDBMovie | null) => setTmdbData(data ?? null))
      .catch(() => {});
  }, [title, year, tmdbData]);

  const posterUrl = tmdbData?.posterPath ? `${TMDB_IMAGE_BASE}${tmdbData.posterPath}` : null;
  const rating = tmdbData?.voteAverage ? tmdbData.voteAverage.toFixed(1) : null;
  const runtime = tmdbData?.runtime
    ? `${Math.floor(tmdbData.runtime / 60)}h ${tmdbData.runtime % 60}m`
    : null;
  const genres = tmdbData?.genres?.slice(0, 2).map((g) => g.name) ?? [];
  const initials = title.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <div className={styles.card}>
      <div className={styles.posterWrapper}>
        {posterUrl ? (
          <Image src={posterUrl} alt={title} fill style={{ objectFit: "cover" }} sizes="220px" />
        ) : (
          <div className={styles.initials}>{initials}</div>
        )}
        {rating && <div className={styles.rating}>★ {rating}</div>}
      </div>

      <div className={styles.info}>
        <div className={styles.title}>{title}</div>
        <div className={styles.meta}>
          {year}{runtime ? ` · ${runtime}` : ""}
          {genres.length > 0 ? ` · ${genres.join(", ")}` : ""}
        </div>
        <div className={styles.synopsis}>
          {tmdbData?.overview
            ? tmdbData.overview.length > 150
              ? tmdbData.overview.slice(0, 150) + "…"
              : tmdbData.overview
            : reason}
        </div>
        {tmdbData?.director && (
          <div className={styles.director}>Dir. {tmdbData.director}</div>
        )}
      </div>

      {!showFeedback && (
        <div className={styles.feedbackBtnWrapper}>
          <button className={styles.feedbackBtn} onClick={() => setShowFeedback(true)}>
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
