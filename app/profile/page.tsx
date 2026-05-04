"use client";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useProfile } from "@/hooks/useProfile";
import ProfileEditor from "@/components/profile/ProfileEditor";
import { UserProfile } from "@/types";

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem("userId");
    if (!id) {
      id = uuidv4();
      localStorage.setItem("userId", id);
    }
    setUserId(id);
  }, []);

  const { profile, loading, updateProfile } = useProfile(userId);

  if (!userId || loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          color: "var(--muted)",
        }}
      >
        Loading…
      </div>
    );
  }

  if (!profile) return null;

  const hasAnyPrefs =
    profile.preferences.genres.liked.length > 0 ||
    profile.preferences.genres.disliked.length > 0 ||
    profile.preferences.actors.liked.length > 0 ||
    profile.preferences.directors.liked.length > 0 ||
    profile.feedbackSummary.length > 0;

  return (
    <div
      style={{
        maxWidth: "640px",
        margin: "0 auto",
        padding: "40px 24px",
      }}
    >
      <h1
        style={{
          fontSize: "24px",
          fontWeight: 800,
          margin: "0 0 8px",
          letterSpacing: "-0.5px",
        }}
      >
        Your Preference Profile
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "14px", margin: "0 0 32px" }}>
        These are learned from your feedback and shape every recommendation.
      </p>

      {!hasAnyPrefs && (
        <div
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "28px",
            color: "var(--muted)",
            fontSize: "14px",
            lineHeight: "1.6",
          }}
        >
          Your profile is still empty. Start chatting and giving feedback on
          recommendations — your preferences will build up automatically.
        </div>
      )}

      {profile.watchedTitles.length > 0 && (
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
            Movies you&apos;ve seen ({profile.watchedTitles.length})
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {profile.watchedTitles.map((t) => (
              <span
                key={t}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "20px",
                  padding: "4px 12px",
                  fontSize: "12px",
                  color: "var(--muted)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <ProfileEditor
        profile={profile}
        onSave={(partial) => updateProfile(partial as Partial<UserProfile>)}
      />
    </div>
  );
}
