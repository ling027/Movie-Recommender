"use client";
import { useState, useEffect, useCallback } from "react";
import { UserProfile } from "@/types";

export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/profile?userId=${userId}`);
      if (res.ok) setProfile(await res.json());
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (partial: Partial<UserProfile>) => {
      if (!userId) return;
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, profile: partial }),
      });
      if (res.ok) setProfile(await res.json());
    },
    [userId]
  );

  return { profile, loading, fetchProfile, updateProfile };
}
