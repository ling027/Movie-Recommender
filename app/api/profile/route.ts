import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser, upsertUser } from "@/lib/db";
import { UserProfile } from "@/types";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  const profile = getOrCreateUser(userId);
  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json() as { userId: string; profile: Partial<UserProfile> };
    const { userId, profile: partial } = body;
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const current = getOrCreateUser(userId);
    const merged: UserProfile = {
      ...current,
      ...partial,
      preferences: {
        ...current.preferences,
        ...(partial.preferences ?? {}),
        genres: {
          liked: partial.preferences?.genres?.liked ?? current.preferences.genres.liked,
          disliked: partial.preferences?.genres?.disliked ?? current.preferences.genres.disliked,
        },
        actors: {
          liked: partial.preferences?.actors?.liked ?? current.preferences.actors.liked,
          disliked: partial.preferences?.actors?.disliked ?? current.preferences.actors.disliked,
        },
        directors: {
          liked: partial.preferences?.directors?.liked ?? current.preferences.directors.liked,
          disliked: partial.preferences?.directors?.disliked ?? current.preferences.directors.disliked,
        },
        era: {
          preferred: partial.preferences?.era?.preferred ?? current.preferences.era.preferred,
          avoided: partial.preferences?.era?.avoided ?? current.preferences.era.avoided,
        },
        runtime: {
          ...current.preferences.runtime,
          ...(partial.preferences?.runtime ?? {}),
        },
      },
      userId,
    };

    upsertUser(merged);
    return NextResponse.json(merged);
  } catch (err) {
    console.error("[/api/profile PUT]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
