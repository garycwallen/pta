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

  // RSVP families table - matches Excel structure
  const createRsvpFamiliesTable = `
    CREATE TABLE IF NOT EXISTS rsvp_families (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,                    -- Column A: Contact person's name
      email TEXT NOT NULL,                   -- Column B: Email address  
      attendee_count INTEGER NOT NULL,       -- Column C: Number of attendees
      grade_levels TEXT,                     -- Column D: Student grade levels (comma-separated)
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // RSVP check-ins table (logging who actually checked in)
  const createRsvpCheckInsTable = `
    CREATE TABLE IF NOT EXISTS rsvp_check_ins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rsvp_family_id INTEGER NOT NULL,
      name TEXT NOT NULL,                    -- Original name from Excel
      email TEXT NOT NULL,                   -- Original email from Excel
      attendee_count INTEGER NOT NULL,       -- Original attendee count
      grade_levels TEXT,                     -- Original grade levels
      checked_in_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // RSVP confirmations table (legacy - keeping for compatibility)
  const createRsvpConfirmationsTable = `
    CREATE TABLE IF NOT EXISTS rsvp_confirmations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.exec(createWalkInRegistrationsTable);
  db.exec(createRsvpFamiliesTable);
  db.exec(createRsvpCheckInsTable);
  db.exec(createRsvpConfirmationsTable);

  console.log('Database initialized successfully at:', dbPath);
}

// Initialize database first
initializeDatabase();

// Prepared statements - created AFTER tables exist
export const statements = {
  // Walk-in statements
  insertWalkInRegistration: db.prepare(`
    INSERT INTO walk_in_registrations (adults, kids, kid_grades, email, total_attendees)
    VALUES (?, ?, ?, ?, ?)
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

  // RSVP Family statements - simplified structure
  insertRsvpFamily: db.prepare(`
    INSERT INTO rsvp_families (name, email, attendee_count, grade_levels)
    VALUES (?, ?, ?, ?)
  `),

  getAllRsvpFamilies: db.prepare(`
    SELECT * FROM rsvp_families ORDER BY name ASC
  `),

  getRsvpFamilyById: db.prepare(`
    SELECT * FROM rsvp_families WHERE id = ?
  `),

  deleteRsvpFamily: db.prepare(`
    DELETE FROM rsvp_families WHERE id = ?
  `),

  // RSVP Check-in statements - simplified structure
  insertRsvpCheckIn: db.prepare(`
    INSERT INTO rsvp_check_ins (rsvp_family_id, name, email, attendee_count, grade_levels)
    VALUES (?, ?, ?, ?, ?)
  `),

  getAllRsvpCheckIns: db.prepare(`
    SELECT * FROM rsvp_check_ins ORDER BY checked_in_at DESC
  `),

  getRsvpCheckInStats: db.prepare(`
    SELECT
      COUNT(*) as total_check_ins,
      SUM(attendee_count) as total_attendees
    FROM rsvp_check_ins
  `),

  // Legacy RSVP confirmation (keeping for compatibility)
  insertRsvpConfirmation: db.prepare(`
    INSERT INTO rsvp_confirmations DEFAULT VALUES
  `),

  getRsvpConfirmationCount: db.prepare(`
    SELECT COUNT(*) as count FROM rsvp_confirmations
  `),
};