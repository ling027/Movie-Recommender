"use client";
import { useState } from "react";
import { UserProfile } from "@/types";

interface Props {
  profile: UserProfile;
  onSave: (partial: Partial<UserProfile>) => Promise<void>;
}

function Tag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "20px",
        padding: "4px 12px",
        fontSize: "13px",
        color: "var(--foreground)",
      }}
    >
      {label}
      <button
        onClick={onRemove}
        style={{
          background: "none",
          border: "none",
          color: "var(--muted)",
          cursor: "pointer",
          padding: 0,
          fontSize: "14px",
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </span>
  );
}

function AddTagInput({
  onAdd,
  placeholder,
}: {
  onAdd: (v: string) => void;
  placeholder: string;
}) {
  const [v, setV] = useState("");
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && v.trim()) {
            onAdd(v.trim());
            setV("");
          }
        }}
        placeholder={placeholder}
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "6px 12px",
          color: "var(--foreground)",
          fontSize: "13px",
          outline: "none",
          fontFamily: "inherit",
          width: "160px",
        }}
      />
      <button
        onClick={() => {
          if (v.trim()) { onAdd(v.trim()); setV(""); }
        }}
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "6px 10px",
          color: "var(--muted)",
          fontSize: "13px",
          cursor: "pointer",
        }}
      >
        Add
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <h3
        style={{
          fontSize: "12px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "1px",
          color: "var(--muted)",
          margin: "0 0 12px",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function ProfileEditor({ profile, onSave }: Props) {
  const [pref, setPref] = useState(structuredClone(profile.preferences));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function removeFrom(
    key: keyof typeof pref.genres,
    category: "genres" | "actors" | "directors",
    value: string
  ) {
    setPref((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: (prev[category] as Record<string, string[]>)[key].filter(
          (x: string) => x !== value
        ),
      },
    }));
  }

  function addTo(
    key: "liked" | "disliked",
    category: "genres" | "actors" | "directors",
    value: string
  ) {
    setPref((prev) => {
      const arr = (prev[category] as Record<string, string[]>)[key];
      if (arr.includes(value)) return prev;
      return {
        ...prev,
        [category]: { ...prev[category], [key]: [...arr, value] },
      };
    });
  }

  async function handleSave() {
    setSaving(true);
    await onSave({ preferences: pref });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const p = pref;

  return (
    <div>
      <Section title="Genres you enjoy">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
          {p.genres.liked.map((g) => (
            <Tag key={g} label={g} onRemove={() => removeFrom("liked", "genres", g)} />
          ))}
        </div>
        <AddTagInput placeholder="Add genre…" onAdd={(v) => addTo("liked", "genres", v)} />
      </Section>

      <Section title="Genres to avoid">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
          {p.genres.disliked.map((g) => (
            <Tag key={g} label={g} onRemove={() => removeFrom("disliked", "genres", g)} />
          ))}
        </div>
        <AddTagInput placeholder="Add genre…" onAdd={(v) => addTo("disliked", "genres", v)} />
      </Section>

      <Section title="Actors you like">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
          {p.actors.liked.map((a) => (
            <Tag key={a} label={a} onRemove={() => removeFrom("liked", "actors", a)} />
          ))}
        </div>
        <AddTagInput placeholder="Add actor…" onAdd={(v) => addTo("liked", "actors", v)} />
      </Section>

      <Section title="Actors to avoid">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
          {p.actors.disliked.map((a) => (
            <Tag key={a} label={a} onRemove={() => removeFrom("disliked", "actors", a)} />
          ))}
        </div>
        <AddTagInput placeholder="Add actor…" onAdd={(v) => addTo("disliked", "actors", v)} />
      </Section>

      <Section title="Directors you like">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
          {p.directors.liked.map((d) => (
            <Tag key={d} label={d} onRemove={() => removeFrom("liked", "directors", d)} />
          ))}
        </div>
        <AddTagInput placeholder="Add director…" onAdd={(v) => addTo("liked", "directors", v)} />
      </Section>

      <Section title="Max runtime">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <input
            type="range"
            min={60}
            max={240}
            step={15}
            value={p.runtime.maxMinutes ?? 180}
            onChange={(e) =>
              setPref((prev) => ({
                ...prev,
                runtime: { ...prev.runtime, maxMinutes: parseInt(e.target.value) },
              }))
            }
            style={{ flex: 1, accentColor: "var(--accent)" }}
          />
          <span style={{ color: "var(--foreground)", fontSize: "14px", minWidth: "60px" }}>
            {p.runtime.maxMinutes ? `${p.runtime.maxMinutes} min` : "Any"}
          </span>
          {p.runtime.maxMinutes && (
            <button
              onClick={() =>
                setPref((prev) => ({
                  ...prev,
                  runtime: { ...prev.runtime, maxMinutes: null },
                }))
              }
              style={{
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                color: "var(--muted)",
                fontSize: "12px",
                padding: "4px 8px",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          )}
        </div>
      </Section>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          background: "var(--accent)",
          color: "#fff",
          border: "none",
          borderRadius: "12px",
          padding: "12px 28px",
          fontSize: "14px",
          fontWeight: 700,
          cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.7 : 1,
          transition: "opacity 0.15s",
        }}
      >
        {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Preferences"}
      </button>
    </div>
  );
}
