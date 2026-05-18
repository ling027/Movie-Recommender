import { UserProfile, FeedbackEntry, TMDBMovie } from "@/types";
import { extractPreferenceSignals } from "@/lib/claude";

function addUnique(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr : [...arr, value];
}

function removeItem(arr: string[], value: string): string[] {
  return arr.filter((x) => x !== value);
}

function decadeLabel(year: number): string {
  return `${Math.floor(year / 10) * 10}s`;
}

export async function updateProfileFromFeedback(
  profile: UserProfile,
  feedback: FeedbackEntry,
  tmdbData: TMDBMovie | null,
  runtime: number | null = null
): Promise<UserProfile> {
  const updated = structuredClone(profile);
  const p = updated.preferences;

  // Always: add to watchedTitles if liked or already_seen
  if (feedback.reaction === "liked" || feedback.reaction === "already_seen") {
    updated.watchedTitles = addUnique(
      updated.watchedTitles,
      feedback.movieTitle
    );
  }

  // Process quick tags
  for (const tag of feedback.quickTags) {
    if (tag === "too_old" && tmdbData?.releaseDate) {
      const year = parseInt(tmdbData.releaseDate.slice(0, 4), 10);
      if (!isNaN(year)) {
        const decade = decadeLabel(year);
        p.era.avoided = addUnique(p.era.avoided, decade);
      }
    }

    if (tag === "too_long") {
      p.runtime.prefersShorter = true;
      const movieRuntime = runtime ?? tmdbData?.runtime ?? null;
      if (movieRuntime) {
        const newMax = Math.min(movieRuntime - 15, 120);
        if (!p.runtime.maxMinutes || newMax < p.runtime.maxMinutes) {
          p.runtime.maxMinutes = Math.max(newMax, 60);
        }
      }
    }

    if (tag === "not_my_genre") {
      const genres = feedback.specifiedGenres?.length
        ? feedback.specifiedGenres
        : tmdbData?.genres?.map((g) => g.name) ?? [];
      for (const g of genres) {
        p.genres.disliked = addUnique(p.genres.disliked, g);
        p.genres.liked = removeItem(p.genres.liked, g);
      }
    }

    if (tag === "too_slow") {
      if (p.pacing === "slow") p.pacing = "moderate";
      else if (!p.pacing) p.pacing = "moderate";
    }

    if (tag === "too_intense") {
      p.avoidThemes = addUnique(p.avoidThemes, "graphic violence");
      p.avoidThemes = addUnique(p.avoidThemes, "extreme tension");
    }

    if (tag === "loved_it" && tmdbData?.genres?.length) {
      for (const g of tmdbData.genres) {
        p.genres.liked = addUnique(p.genres.liked, g.name);
      }
      if (tmdbData.director) {
        p.directors.liked = addUnique(p.directors.liked, tmdbData.director);
      }
      updated.watchedTitles = addUnique(
        updated.watchedTitles,
        feedback.movieTitle
      );
    }

    if (tag === "dislike_actor") {
      if (feedback.specifiedActors?.length) {
        for (const actor of feedback.specifiedActors) {
          p.actors.disliked = addUnique(p.actors.disliked, actor);
        }
      } else if (feedback.freeText) {
        const signals = await extractPreferenceSignals(feedback.freeText);
        if (signals.dislikedActors?.length) {
          for (const actor of signals.dislikedActors) {
            p.actors.disliked = addUnique(p.actors.disliked, actor);
          }
        }
      }
    }
  }

  // Process free text for liked reactions
  if (feedback.reaction === "liked" && feedback.freeText) {
    const signals = await extractPreferenceSignals(feedback.freeText);
    if (signals.likedGenres)
      for (const g of signals.likedGenres)
        p.genres.liked = addUnique(p.genres.liked, g);
    if (signals.dislikedGenres)
      for (const g of signals.dislikedGenres)
        p.genres.disliked = addUnique(p.genres.disliked, g);
    if (signals.likedActors)
      for (const a of signals.likedActors)
        p.actors.liked = addUnique(p.actors.liked, a);
    if (signals.dislikedActors)
      for (const a of signals.dislikedActors)
        p.actors.disliked = addUnique(p.actors.disliked, a);
    if (signals.likedDirectors)
      for (const d of signals.likedDirectors)
        p.directors.liked = addUnique(p.directors.liked, d);
    if (signals.preferredPacing) p.pacing = signals.preferredPacing;
    if (signals.preferredTones)
      for (const t of signals.preferredTones)
        p.tones = addUnique(p.tones, t);
    if (signals.themes)
      for (const t of signals.themes) p.themes = addUnique(p.themes, t);
  }

  // Append to feedback summary (cap at 20)
  updated.feedbackSummary = [...updated.feedbackSummary, feedback].slice(-20);
  updated.updatedAt = new Date().toISOString();

  return updated;
}
