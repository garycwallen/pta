import { Router } from 'express';
import {
  createWalkInRegistration,
  getWalkInRegistrations,
  getRsvpFamilies,
  processRsvpCheckIn,
  addRsvpFamily,
  getRsvpCheckIns,
  getStats
} from '../controllers/registrationController';

const router = Router();

// Walk-in routes
router.post('/walk-in', createWalkInRegistration);
router.get('/walk-in', getWalkInRegistrations);

// RSVP Family routes
router.get('/rsvp-families', getRsvpFamilies);
router.post('/rsvp-families', addRsvpFamily);
router.post('/rsvp-checkin', processRsvpCheckIn);

// RSVP Check-in routes
router.get('/rsvp-checkins', getRsvpCheckIns);

// Statistics
router.get('/stats', getStats);

export default router;