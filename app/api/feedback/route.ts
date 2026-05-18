import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getOrCreateUser, upsertUser, saveFeedback } from "@/lib/db";
import { updateProfileFromFeedback } from "@/lib/profileBuilder";
import { fetchMovieDetails } from "@/lib/tmdb";
import { FeedbackEntry, QuickTag } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      userId: string;
      movieTitle: string;
      tmdbId: number | null;
      reaction: FeedbackEntry["reaction"];
      quickTags: QuickTag[];
      freeText: string;
      movieRuntime?: number | null;
      specifiedGenres?: string[];
      specifiedActors?: string[];
    };

    const { userId, movieTitle, tmdbId, reaction, quickTags, freeText, movieRuntime, specifiedGenres, specifiedActors } = body;
    if (!userId || !movieTitle) {
      return NextResponse.json({ error: "userId and movieTitle required" }, { status: 400 });
    }

    const entry: FeedbackEntry = {
      movieTitle,
      tmdbId: tmdbId ?? null,
      timestamp: new Date().toISOString(),
      reaction,
      quickTags: quickTags ?? [],
      freeText: freeText ?? "",
      specifiedGenres: specifiedGenres ?? [],
      specifiedActors: specifiedActors ?? [],
    };

    const feedbackId = uuidv4();
    saveFeedback(userId, feedbackId, entry);

    const tmdbData = tmdbId ? await fetchMovieDetails(tmdbId).catch(() => null) : null;
    const runtime = movieRuntime ?? tmdbData?.runtime ?? null;

    const profile = getOrCreateUser(userId);
    const updatedProfile = await updateProfileFromFeedback(profile, entry, tmdbData, runtime);
    upsertUser(updatedProfile);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/feedback]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
