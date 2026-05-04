import Anthropic from "@anthropic-ai/sdk";
import { ChatMessage, MovieRecommendation } from "@/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const TITLE_REGEX = /\*\*([^*]+?)\s*\((\d{4})\)\*\*/g;

export function extractRecommendations(text: string): MovieRecommendation[] {
  const recommendations: MovieRecommendation[] = [];
  let match: RegExpExecArray | null;

  TITLE_REGEX.lastIndex = 0;
  while ((match = TITLE_REGEX.exec(text)) !== null) {
    const title = match[1].trim();
    const year = parseInt(match[2], 10);

    // Extract the "Because..." sentence that follows the title
    const afterTitle = text.slice(match.index + match[0].length);
    const becauseMatch = afterTitle.match(/Because[^.!?]*[.!?]/);
    const reason = becauseMatch
      ? becauseMatch[0].trim()
      : "Recommended based on your preferences.";

    recommendations.push({ title, year, reason });
  }

  return recommendations;
}

export async function chatWithClaude(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: userMessage },
  ];

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: systemPrompt,
    messages,
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

export async function extractPreferenceSignals(
  freeText: string
): Promise<Partial<{
  likedGenres: string[];
  dislikedGenres: string[];
  likedActors: string[];
  dislikedActors: string[];
  likedDirectors: string[];
  preferredPacing: "slow" | "moderate" | "fast";
  preferredTones: string[];
  themes: string[];
}>> {
  if (!freeText.trim()) return {};

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    system:
      "You extract movie preference signals from user feedback. Return ONLY valid JSON with these optional keys: likedGenres, dislikedGenres, likedActors, dislikedActors, likedDirectors, preferredPacing (slow|moderate|fast), preferredTones, themes. All values are arrays of strings. Return {} if nothing useful can be extracted.",
    messages: [{ role: "user", content: freeText }],
  });

  const block = response.content[0];
  if (block.type !== "text") return {};

  try {
    const jsonMatch = block.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};
    return JSON.parse(jsonMatch[0]);
  } catch {
    return {};
  }
}
