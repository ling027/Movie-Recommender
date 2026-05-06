"use client";
import { useState } from "react";
import { UserProfile } from "@/types";
import styles from "./ProfileEditor.module.css";

interface Props {
  profile: UserProfile;
  onSave: (partial: Partial<UserProfile>) => Promise<void>;
}

function Tag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className={styles.tag}>
      {label}
      <button className={styles.tagRemoveBtn} onClick={onRemove}>×</button>
    </span>
  );
}

function AddTagInput({ onAdd, placeholder }: { onAdd: (v: string) => void; placeholder: string }) {
  const [v, setV] = useState("");
  return (
    <div className={styles.addTagRow}>
      <input
        className={styles.addTagInput}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && v.trim()) { onAdd(v.trim()); setV(""); }
        }}
        placeholder={placeholder}
      />
      <button
        className={styles.addTagBtn}
        onClick={() => { if (v.trim()) { onAdd(v.trim()); setV(""); } }}
      >
        Add
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

export default function ProfileEditor({ profile, onSave }: Props) {
  const [pref, setPref] = useState(structuredClone(profile.preferences));
  const [watched, setWatched] = useState<string[]>(profile.watchedTitles);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function removeFrom(key: keyof typeof pref.genres, category: "genres" | "actors" | "directors", value: string) {
    setPref((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: (prev[category] as Record<string, string[]>)[key].filter((x: string) => x !== value),
      },
    }));
  }

  function addTo(key: "liked" | "disliked", category: "genres" | "actors" | "directors", value: string) {
    setPref((prev) => {
      const arr = (prev[category] as Record<string, string[]>)[key];
      if (arr.includes(value)) return prev;
      return { ...prev, [category]: { ...prev[category], [key]: [...arr, value] } };
    });
  }

  async function handleSave() {
    setSaving(true);
    await onSave({ preferences: pref, watchedTitles: watched });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const p = pref;

  return (
    <div>
      <Section title="Genres you enjoy">
        <div className={styles.tagList}>
          {p.genres.liked.map((g) => <Tag key={g} label={g} onRemove={() => removeFrom("liked", "genres", g)} />)}
        </div>
        <AddTagInput placeholder="Add genre…" onAdd={(v) => addTo("liked", "genres", v)} />
      </Section>

      <Section title="Genres to avoid">
        <div className={styles.tagList}>
          {p.genres.disliked.map((g) => <Tag key={g} label={g} onRemove={() => removeFrom("disliked", "genres", g)} />)}
        </div>
        <AddTagInput placeholder="Add genre…" onAdd={(v) => addTo("disliked", "genres", v)} />
      </Section>

      <Section title="Actors you like">
        <div className={styles.tagList}>
          {p.actors.liked.map((a) => <Tag key={a} label={a} onRemove={() => removeFrom("liked", "actors", a)} />)}
        </div>
        <AddTagInput placeholder="Add actor…" onAdd={(v) => addTo("liked", "actors", v)} />
      </Section>

      <Section title="Actors to avoid">
        <div className={styles.tagList}>
          {p.actors.disliked.map((a) => <Tag key={a} label={a} onRemove={() => removeFrom("disliked", "actors", a)} />)}
        </div>
        <AddTagInput placeholder="Add actor…" onAdd={(v) => addTo("disliked", "actors", v)} />
      </Section>

      <Section title="Directors you like">
        <div className={styles.tagList}>
          {p.directors.liked.map((d) => <Tag key={d} label={d} onRemove={() => removeFrom("liked", "directors", d)} />)}
        </div>
        <AddTagInput placeholder="Add director…" onAdd={(v) => addTo("liked", "directors", v)} />
      </Section>

      <Section title="Max runtime">
        <div className={styles.runtimeRow}>
          <input
            type="range"
            className={styles.runtimeSlider}
            min={60}
            max={240}
            step={15}
            value={p.runtime.maxMinutes ?? 180}
            onChange={(e) =>
              setPref((prev) => ({ ...prev, runtime: { ...prev.runtime, maxMinutes: parseInt(e.target.value) } }))
            }
          />
          <span className={styles.runtimeLabel}>
            {p.runtime.maxMinutes ? `${p.runtime.maxMinutes} min` : "Any"}
          </span>
          {p.runtime.maxMinutes && (
            <button
              className={styles.clearBtn}
              onClick={() => setPref((prev) => ({ ...prev, runtime: { ...prev.runtime, maxMinutes: null } }))}
            >
              Clear
            </button>
          )}
        </div>
      </Section>

      <Section title="Movies you've already seen">
        <div className={styles.tagList}>
          {watched.map((t) => (
            <Tag key={t} label={t} onRemove={() => setWatched((prev) => prev.filter((x) => x !== t))} />
          ))}
        </div>
        <AddTagInput placeholder="Add movie title…" onAdd={(v) => setWatched((prev) => prev.includes(v) ? prev : [...prev, v])} />
      </Section>

      <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Preferences"}
      </button>
    </div>
  );
}
