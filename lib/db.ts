import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { UserProfile, FeedbackEntry, createEmptyProfile } from "@/types";

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
  `);

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
