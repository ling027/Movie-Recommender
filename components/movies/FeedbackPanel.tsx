"use client";
import { useState } from "react";
import { QuickTag, MovieRecommendation } from "@/types";
import styles from "./FeedbackPanel.module.css";

const TAGS: { id: QuickTag; label: string }[] = [
  { id: "loved_it", label: "Loved it" },
  { id: "already_seen", label: "Already seen" },
  { id: "too_long", label: "Too long" },
  { id: "too_old", label: "Too old" },
  { id: "not_my_genre", label: "Not my genre" },
  { id: "dislike_actor", label: "Dislike actor" },
  { id: "too_intense", label: "Too intense" },
  { id: "too_slow", label: "Too slow" },
];

interface Props {
  recommendation: MovieRecommendation;
  userId: string;
  onClose: () => void;
  onSubmit: () => void;
}

function ChipInput({
  label,
  placeholder,
  values,
  onChange,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function add() {
    const v = input.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput("");
  }

  return (
    <div className={styles.chipBlock}>
      <span className={styles.chipLabel}>{label}</span>
      <div className={styles.chipRow}>
        {values.map((v) => (
          <span key={v} className={styles.chip}>
            {v}
            <button className={styles.chipRemove} onClick={() => onChange(values.filter((x) => x !== v))}>×</button>
          </span>
        ))}
        <input
          className={styles.chipInput}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
        />
        <button className={styles.chipAddBtn} onClick={add}>Add</button>
      </div>
    </div>
  );
}

export default function FeedbackPanel({ recommendation, userId, onClose, onSubmit }: Props) {
  const [selectedTags, setSelectedTags] = useState<QuickTag[]>([]);
  const [specifiedGenres, setSpecifiedGenres] = useState<string[]>([]);
  const [specifiedActors, setSpecifiedActors] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState(false);

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
    setSubmitError(false);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          movieTitle: recommendation.title,
          tmdbId: recommendation.tmdbData?.id ?? null,
          movieRuntime: recommendation.tmdbData?.runtime ?? null,
          reaction: deriveReaction(),
          quickTags: selectedTags,
          freeText,
          specifiedGenres,
          specifiedActors,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setDone(true);
      onSubmit();
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return <div className={styles.done}>✓ Got it — we&apos;ll tune your recommendations.</div>;
  }

  const showGenreInput = selectedTags.includes("not_my_genre");
  const showActorInput = selectedTags.includes("dislike_actor");

  return (
    <div className={styles.panel}>
      <div className={styles.tags}>
        {TAGS.map((t) => (
          <button
            key={t.id}
            onClick={() => toggleTag(t.id)}
            className={`${styles.tag} ${selectedTags.includes(t.id) ? styles.tagSelected : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {showGenreInput && (
        <ChipInput
          label="Which genre?"
          placeholder="e.g. Horror"
          values={specifiedGenres}
          onChange={setSpecifiedGenres}
        />
      )}

      {showActorInput && (
        <ChipInput
          label="Which actor?"
          placeholder="e.g. Adam Sandler"
          values={specifiedActors}
          onChange={setSpecifiedActors}
        />
      )}

      <textarea
        className={styles.textarea}
        value={freeText}
        onChange={(e) => setFreeText(e.target.value)}
        placeholder="Tell us more (optional)…"
        rows={2}
      />
      {submitError && (
        <div className={styles.submitError}>Something went wrong — please try again.</div>
      )}
      <div className={styles.actions}>
        <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={submitting || (selectedTags.length === 0 && !freeText.trim())}
        >
          {submitting ? "Saving…" : "Submit"}
        </button>
      </div>
    </div>
  );
}
