import { NextRequest, NextResponse } from "next/server";
import { getMessagesBySession } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!userId || !sessionId) {
    return NextResponse.json({ error: "userId and sessionId required" }, { status: 400 });
  }
  const messages = getMessagesBySession(userId, sessionId);
  return NextResponse.json(messages);
}
