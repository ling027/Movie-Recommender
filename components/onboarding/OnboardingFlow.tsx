"use client";
import { useState } from "react";
import styles from "./OnboardingFlow.module.css";

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
    <div className={styles.container}>
      <div className={styles.emoji}>🎬</div>
      <h1 className={styles.heading}>What are you in the mood for?</h1>
      <p className={styles.subtitle}>
        Describe what you&apos;re looking for in your own words — I&apos;ll find movies
        that genuinely match your taste.
      </p>

      <div className={styles.textareaWrapper}>
        <textarea
          className={styles.textarea}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleStart();
            }
          }}
          placeholder='for example: "I want some true crime documentaries with twists and turns" or "Surprise me'
          rows={3}
          autoFocus
        />
      </div>

      <button
        className={styles.submitBtn}
        onClick={handleStart}
        disabled={!input.trim()}
      >
        Find my movies →
      </button>

      <div className={styles.suggestionsWrapper}>
        <p className={styles.suggestionsLabel}>Not sure? Try one of these:</p>
        <div className={styles.suggestionsList}>
          {PROMPTS.map((p) => (
            <button
              key={p}
              className={styles.suggestionBtn}
              onClick={() => onStart(p)}
            >
              &quot;{p}&quot;
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
