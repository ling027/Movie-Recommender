import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser, upsertUser } from "@/lib/db";
import { buildSystemPrompt } from "@/lib/promptBuilder";
import { chatWithClaude, extractRecommendations } from "@/lib/claude";
import { searchMovie } from "@/lib/tmdb";
import { ChatMessage } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      userId: string;
      message: string;
      history: ChatMessage[];
    };

    const { userId, message, history } = body;
    if (!userId || !message) {
      return NextResponse.json({ error: "userId and message required" }, { status: 400 });
    }

    const profile = getOrCreateUser(userId);
    const systemPrompt = buildSystemPrompt(profile);

    const reply = await chatWithClaude(systemPrompt, history, message);

    const rawRecommendations = extractRecommendations(reply);

    // Enrich with TMDB in parallel
    const recommendations = await Promise.all(
      rawRecommendations.map(async (rec) => {
        const tmdbData = await searchMovie(rec.title, rec.year).catch(() => null);
        return { ...rec, tmdbData };
      })
    );

    // Track recommended titles to avoid repeats
    const newTitles = rawRecommendations.map((r) => r.title);
    profile.recommendedTitles = [
      ...profile.recommendedTitles,
      ...newTitles,
    ].slice(-100);
    upsertUser(profile);

    return NextResponse.json({ reply, recommendations });
  } catch (err) {
    console.error("[/api/chat]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
