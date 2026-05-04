import { NextRequest, NextResponse } from "next/server";
import { searchMovie } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title");
  const yearParam = searchParams.get("year");

  if (!title) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  const year = yearParam ? parseInt(yearParam, 10) : undefined;
  const movie = await searchMovie(title, year).catch(() => null);
  return NextResponse.json(movie);
}
