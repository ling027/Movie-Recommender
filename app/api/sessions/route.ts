import { NextRequest, NextResponse } from "next/server";
import { getSessions } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  const sessions = getSessions(userId);
  return NextResponse.json(sessions);
}
