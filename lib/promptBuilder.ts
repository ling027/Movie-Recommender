import { UserProfile } from "@/types";

const STATIC_RULES = `You are a knowledgeable, warm movie recommendation assistant with excellent taste.

FORMATTING RULES (strictly follow these for parsing):
- Always recommend exactly 3-5 movies per response (unless the user asks for a different number)
- Format each movie title EXACTLY as: **Title (Year)** — bold with year in parentheses
- After each title, write one sentence starting with the word "Because" that explains why this movie fits the user's taste
- Never recommend any movie in the "Already Recommended" or "Already Seen" lists
- Keep recommendations fresh — vary genres and styles unless the user asks to narrow down

CONVERSATION RULES:
- If the user asks a follow-up question (shorter? older? who's the director?), answer naturally first, then offer adjusted recommendations
- If the user gives you a mood or context ("weekend movie", "something to watch with family"), interpret it and explain your reasoning
- Be concise. Don't pad your responses.`;

function serializePreferences(profile: UserProfile): string {
  const p = profile.preferences;
  const lines: string[] = [];

  if (p.genres.liked.length)
    lines.push(`Genres they enjoy: ${p.genres.liked.join(", ")}`);
  if (p.genres.disliked.length)
    lines.push(`Genres to avoid: ${p.genres.disliked.join(", ")}`);
  if (p.tones.length) lines.push(`Preferred tone: ${p.tones.join(", ")}`);
  if (p.pacing) lines.push(`Preferred pacing: ${p.pacing}`);
  if (p.era.preferred.length)
    lines.push(`Preferred eras: ${p.era.preferred.join(", ")}`);
  if (p.era.avoided.length)
    lines.push(`Eras to avoid: ${p.era.avoided.join(", ")}`);
  if (p.runtime.maxMinutes)
    lines.push(
      `Maximum runtime: ${p.runtime.maxMinutes} minutes${p.runtime.prefersShorter ? " (prefers shorter films)" : ""}`
    );
  else if (p.runtime.prefersShorter)
    lines.push("Prefers shorter films");
  if (p.actors.liked.length)
    lines.push(`Actors they like: ${p.actors.liked.join(", ")}`);
  if (p.actors.disliked.length)
    lines.push(`Actors to avoid: ${p.actors.disliked.join(", ")}`);
  if (p.directors.liked.length)
    lines.push(`Directors they like: ${p.directors.liked.join(", ")}`);
  if (p.directors.disliked.length)
    lines.push(`Directors to avoid: ${p.directors.disliked.join(", ")}`);
  if (p.themes.length)
    lines.push(`Themes they enjoy: ${p.themes.join(", ")}`);
  if (p.avoidThemes.length)
    lines.push(`Themes to avoid: ${p.avoidThemes.join(", ")}`);

  return lines.length
    ? `## User Preference Profile\n${lines.join("\n")}`
    : "## User Preference Profile\nNo preferences established yet — this is a new user. Recommend broadly appealing films and ask what they liked or disliked to build their profile.";
}

function serializeFeedback(profile: UserProfile): string {
  const recent = profile.feedbackSummary.slice(-5);
  if (!recent.length) return "";

  const lines = recent.map((f) => {
    const tags = f.quickTags.length ? ` [${f.quickTags.join(", ")}]` : "";
    const text = f.freeText ? ` — "${f.freeText}"` : "";
    const reaction = f.reaction === "liked" ? "Enjoyed" : f.reaction === "already_seen" ? "Already seen" : "Did not like";
    return `- ${reaction} "${f.movieTitle}"${tags}${text}`;
  });

  return `## Recent Feedback\n${lines.join("\n")}`;
}

function serializeExclusions(profile: UserProfile): string {
  const lines: string[] = [];

  if (profile.recommendedTitles.length) {
    lines.push(
      `Already Recommended (do not suggest again): ${profile.recommendedTitles.slice(-30).join(", ")}`
    );
  }
  if (profile.watchedTitles.length) {
    lines.push(
      `Already Seen: ${profile.watchedTitles.join(", ")}`
    );
  }

  return lines.length ? `## Exclusion Lists\n${lines.join("\n")}` : "";
}

export function buildSystemPrompt(profile: UserProfile): string {
  const sections = [
    STATIC_RULES,
    serializePreferences(profile),
    serializeFeedback(profile),
    serializeExclusions(profile),
  ].filter(Boolean);

  return sections.join("\n\n");
}
