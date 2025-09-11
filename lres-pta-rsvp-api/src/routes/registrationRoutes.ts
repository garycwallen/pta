import { Router } from 'express';
import {
  createWalkInRegistration,
  getWalkInRegistrations,
  getRsvpFamilies,
  processRsvpCheckIn,
  addRsvpFamily,
  getRsvpCheckIns,
  createRsvpConfirmation,
  getStats,
} from '../controllers/registrationController';

const router = Router();

// Walk-in routes
router.post('/walk-in', createWalkInRegistration);
router.get('/walk-in', getWalkInRegistrations);

// RSVP Family routes
router.get('/rsvp-families', getRsvpFamilies);           // Get all available RSVP families
router.post('/rsvp-families', addRsvpFamily);            // Add new RSVP family (admin)
router.post('/rsvp-checkin', processRsvpCheckIn);        // Process RSVP check-in

// RSVP Check-in routes
router.get('/rsvp-checkins', getRsvpCheckIns);           // Get all RSVP check-ins

// Legacy RSVP route (keeping for compatibility)
router.post('/rsvp', createRsvpConfirmation);

// Statistics
router.get('/stats', getStats);

export default router;