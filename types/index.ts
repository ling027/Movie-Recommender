export type QuickTag =
  | "too_old"
  | "too_long"
  | "not_my_genre"
  | "dislike_actor"
  | "loved_it"
  | "already_seen"
  | "too_intense"
  | "too_slow";

export interface FeedbackEntry {
  movieTitle: string;
  tmdbId: number | null;
  timestamp: string;
  reaction: "liked" | "disliked" | "not_interested" | "already_seen";
  quickTags: QuickTag[];
  freeText: string;
}

export interface UserProfile {
  userId: string;
  createdAt: string;
  updatedAt: string;
  onboardingComplete: boolean;
  preferences: {
    genres: { liked: string[]; disliked: string[] };
    tones: string[];
    pacing: "slow" | "moderate" | "fast" | null;
    era: { preferred: string[]; avoided: string[] };
    runtime: { maxMinutes: number | null; prefersShorter: boolean };
    actors: { liked: string[]; disliked: string[] };
    directors: { liked: string[]; disliked: string[] };
    themes: string[];
    avoidThemes: string[];
  };
  feedbackSummary: FeedbackEntry[];
  watchedTitles: string[];
  recommendedTitles: string[];
}

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  releaseDate: string;
  posterPath: string | null;
  backdropPath: string | null;
  genres: { id: number; name: string }[];
  runtime: number | null;
  voteAverage: number;
  cast: { name: string; character: string }[];
  director: string | null;
}

export interface MovieRecommendation {
  title: string;
  year?: number;
  reason: string;
  tmdbData?: TMDBMovie | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  recommendations?: MovieRecommendation[];
}

export interface SessionSummary {
  sessionId: string;
  preview: string;
  createdAt: string;
  messageCount: number;
}

export function createEmptyProfile(userId: string): UserProfile {
  const now = new Date().toISOString();
  return {
    userId,
    createdAt: now,
    updatedAt: now,
    onboardingComplete: false,
    preferences: {
      genres: { liked: [], disliked: [] },
      tones: [],
      pacing: null,
      era: { preferred: [], avoided: [] },
      runtime: { maxMinutes: null, prefersShorter: false },
      actors: { liked: [], disliked: [] },
      directors: { liked: [], disliked: [] },
      themes: [],
      avoidThemes: [],
    },
    feedbackSummary: [],
    watchedTitles: [],
    recommendedTitles: [],
  };
}
