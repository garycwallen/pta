import Database from 'better-sqlite3';
import path from 'path';
const dbPath = path.join(process.cwd(), 'data', 'event-checkin.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

export function initializeDatabase() {
  // Walk-in registrations table
  const createWalkInRegistrationsTable = `
    CREATE TABLE IF NOT EXISTS walk_in_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      adults INTEGER NOT NULL DEFAULT 0,
      kids INTEGER NOT NULL DEFAULT 0,
      kid_grades TEXT, -- JSON array of grades
      email TEXT,
      total_attendees INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // RSVP confirmations table
  const createRsvpConfirmationsTable = `
    CREATE TABLE IF NOT EXISTS rsvp_confirmations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.exec(createWalkInRegistrationsTable);
  db.exec(createRsvpConfirmationsTable);

  console.log('Database initialized successfully at:', dbPath);
}

// Initialize database first
initializeDatabase();

// Prepared statements - created AFTER tables exist
export const statements = {
  insertWalkInRegistration: db.prepare(`
    INSERT INTO walk_in_registrations (adults, kids, kid_grades, email, total_attendees)
    VALUES (?, ?, ?, ?, ?)
  `),
  
  insertRsvpConfirmation: db.prepare(`
    INSERT INTO rsvp_confirmations DEFAULT VALUES
  `),
  
  getAllWalkInRegistrations: db.prepare(`
    SELECT * FROM walk_in_registrations ORDER BY created_at DESC
  `),
  
  getWalkInStats: db.prepare(`
    SELECT
      COUNT(*) as total_registrations,
      SUM(adults) as total_adults,
      SUM(kids) as total_kids,
      SUM(total_attendees) as total_attendees
    FROM walk_in_registrations
  `),
  
  getRsvpConfirmationCount: db.prepare(`
    SELECT COUNT(*) as count FROM rsvp_confirmations
  `)
};