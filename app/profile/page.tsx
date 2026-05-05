"use client";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useProfile } from "@/hooks/useProfile";
import ProfileEditor from "@/components/profile/ProfileEditor";
import { UserProfile } from "@/types";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem("userId");
    if (!id) { id = uuidv4(); localStorage.setItem("userId", id); }
    setUserId(id);
  }, []);

  const { profile, loading, updateProfile } = useProfile(userId);

  if (!userId || loading) {
    return <div className={styles.loading}>Loading…</div>;
  }

  if (!profile) return null;

  const hasAnyPrefs =
    profile.preferences.genres.liked.length > 0 ||
    profile.preferences.genres.disliked.length > 0 ||
    profile.preferences.actors.liked.length > 0 ||
    profile.preferences.directors.liked.length > 0 ||
    profile.feedbackSummary.length > 0;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Your Preference Profile</h1>
      <p className={styles.subtitle}>
        These are learned from your feedback and shape every recommendation.
      </p>

      {!hasAnyPrefs && (
        <div className={styles.emptyNotice}>
          Your profile is still empty. Start chatting and giving feedback on
          recommendations — your preferences will build up automatically.
        </div>
      )}

      {profile.watchedTitles.length > 0 && (
        <div className={styles.watchedSection}>
          <h3 className={styles.watchedTitle}>
            Movies you&apos;ve seen ({profile.watchedTitles.length})
          </h3>
          <div className={styles.watchedList}>
            {profile.watchedTitles.map((t) => (
              <span key={t} className={styles.watchedTag}>{t}</span>
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
