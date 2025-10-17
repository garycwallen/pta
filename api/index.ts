const express = require('express');
const cors = require('cors');

// Import your Supabase client
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import your controller functions
const {
  createWalkInRegistration,
  getRsvpFamilies,
  processRsvpCheckIn,
  addRsvpFamily,
  getWalkInRegistrations,
  getRsvpCheckIns,
  getStats
} = require('../lres-pta-rsvp-api/src/controllers/registrationController');

// Define routes directly
app.post('/api/walk-in', createWalkInRegistration);
app.get('/api/walk-in', getWalkInRegistrations);
app.get('/api/rsvp-families', getRsvpFamilies);
app.post('/api/rsvp-families', addRsvpFamily);
app.post('/api/rsvp-checkin', processRsvpCheckIn);
app.get('/api/rsvp-checkins', getRsvpCheckIns);
app.get('/api/stats', getStats);

// Export for Vercel
module.exports = app;