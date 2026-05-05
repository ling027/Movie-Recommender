import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { UserProfile, FeedbackEntry, ChatMessage, SessionSummary, createEmptyProfile } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.sqlite");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");

  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      profile_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      movie_title TEXT NOT NULL,
      tmdb_id INTEGER,
      feedback_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_id TEXT NOT NULL DEFAULT 'legacy',
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      recommendations_json TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Migrate: add session_id column if it doesn't exist yet
  try {
    _db.exec(`ALTER TABLE messages ADD COLUMN session_id TEXT NOT NULL DEFAULT 'legacy'`);
  } catch {
    // Column already exists — ignore
  }

  return _db;
}

export function getUser(userId: string): UserProfile | null {
  const db = getDb();
  const row = db
    .prepare("SELECT profile_json FROM users WHERE id = ?")
    .get(userId) as { profile_json: string } | undefined;
  if (!row) return null;
  return JSON.parse(row.profile_json) as UserProfile;
}

export function upsertUser(profile: UserProfile): void {
  const db = getDb();
  const now = new Date().toISOString();
  profile.updatedAt = now;
  db.prepare(`
    INSERT INTO users (id, profile_json, created_at, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      profile_json = excluded.profile_json,
      updated_at = excluded.updated_at
  `).run(profile.userId, JSON.stringify(profile), profile.createdAt, now);
}

export function getOrCreateUser(userId: string): UserProfile {
  const existing = getUser(userId);
  if (existing) return existing;

  const profile = createEmptyProfile(userId);
  upsertUser(profile);
  return profile;
}

export function saveMessage(
  userId: string,
  sessionId: string,
  message: ChatMessage
): void {
  const db = getDb();
  db.prepare(`
    INSERT OR IGNORE INTO messages (id, user_id, session_id, role, content, recommendations_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    message.id,
    userId,
    sessionId,
    message.role,
    message.content,
    message.recommendations ? JSON.stringify(message.recommendations) : null,
    message.timestamp
  );
}

export function getMessagesBySession(userId: string, sessionId: string): ChatMessage[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT * FROM messages WHERE user_id = ? AND session_id = ? ORDER BY created_at ASC"
    )
    .all(userId, sessionId) as {
      id: string;
      role: string;
      content: string;
      recommendations_json: string | null;
      created_at: string;
    }[];

  return rows.map((r) => ({
    id: r.id,
    role: r.role as "user" | "assistant",
    content: r.content,
    timestamp: r.created_at,
    recommendations: r.recommendations_json
      ? JSON.parse(r.recommendations_json)
      : undefined,
  }));
}

export function getSessions(userId: string): SessionSummary[] {
  const db = getDb();
  // Get first user message per session as preview
  const rows = db
    .prepare(`
      SELECT
        session_id,
        MIN(created_at) as created_at,
        COUNT(*) as message_count,
        (SELECT content FROM messages m2
         WHERE m2.user_id = m1.user_id AND m2.session_id = m1.session_id AND m2.role = 'user'
         ORDER BY m2.created_at ASC LIMIT 1) as preview
      FROM messages m1
      WHERE user_id = ?
      GROUP BY session_id
      ORDER BY created_at DESC
    `)
    .all(userId) as {
      session_id: string;
      created_at: string;
      message_count: number;
      preview: string;
    }[];

  return rows.map((r) => ({
    sessionId: r.session_id,
    preview: r.preview ?? "New conversation",
    createdAt: r.created_at,
    messageCount: r.message_count,
  }));
}

export function saveFeedback(
  userId: string,
  feedbackId: string,
  entry: FeedbackEntry
): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO feedback (id, user_id, movie_title, tmdb_id, feedback_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    feedbackId,
    userId,
    entry.movieTitle,
    entry.tmdbId,
    JSON.stringify(entry),
    entry.timestamp
  );
}
