import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class DB {
  private static instance: Database.Database | null = null;

  static getInstance(): Database.Database {
    if (!this.instance) {
      const dbPath = path.join(process.cwd(), 'opengoat.db');
      // Initialize synchronous database connection
      this.instance = new Database(dbPath);
      
      // Execute schema definition
      const schema = `
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS goals (
  id            TEXT PRIMARY KEY,
  statement     TEXT NOT NULL,
  category      TEXT NOT NULL,
  current_val   REAL NOT NULL,
  target_val    REAL NOT NULL,
  unit          TEXT NOT NULL,
  deadline      TEXT NOT NULL,
  active_path   TEXT,
  status        TEXT DEFAULT 'active',
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS resource_profiles (
  id            TEXT PRIMARY KEY,
  goal_id       TEXT NOT NULL REFERENCES goals(id),
  profile       TEXT NOT NULL,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS paths (
  id            TEXT PRIMARY KEY,
  goal_id       TEXT NOT NULL REFERENCES goals(id),
  data          TEXT NOT NULL,
  rank          INTEGER NOT NULL,
  is_active     INTEGER DEFAULT 0,
  generated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS gap_log (
  id            TEXT PRIMARY KEY,
  goal_id       TEXT NOT NULL REFERENCES goals(id),
  value         REAL NOT NULL,
  note          TEXT,
  logged_at     TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS interventions (
  id            TEXT PRIMARY KEY,
  goal_id       TEXT NOT NULL REFERENCES goals(id),
  trigger_type  TEXT NOT NULL,
  question      TEXT NOT NULL,
  user_response TEXT,
  constraint_type TEXT,
  unlock_action TEXT,
  resolved      INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS week_scores (
  id            TEXT PRIMARY KEY,
  goal_id       TEXT NOT NULL REFERENCES goals(id),
  week_number   INTEGER NOT NULL,
  velocity_score REAL NOT NULL,
  consistency   REAL NOT NULL,
  momentum      REAL NOT NULL,
  path_fit      REAL NOT NULL,
  total         REAL NOT NULL,
  rank          TEXT NOT NULL,
  xp            INTEGER NOT NULL,
  gap_at_week   REAL,
  scored_at     TEXT DEFAULT (datetime('now')),
  UNIQUE(goal_id, week_number)
);

CREATE TABLE IF NOT EXISTS plugin_registry (
  name          TEXT PRIMARY KEY,
  version       TEXT NOT NULL,
  type          TEXT NOT NULL,
  manifest      TEXT NOT NULL,
  installed_at  TEXT DEFAULT (datetime('now'))
);
`;
      this.instance.exec(schema);
    }
    return this.instance;
  }
}

export const getDB = (): Database.Database => DB.getInstance();
