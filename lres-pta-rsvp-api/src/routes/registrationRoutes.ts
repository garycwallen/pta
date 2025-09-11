import { Router } from 'express';
import {
  createWalkInRegistration,
  createRsvpConfirmation,
  getWalkInRegistrations,
  getStats
} from '../controllers/registrationController';

const router = Router();

// POST /api/registrations/walk-in
router.post('/walk-in', createWalkInRegistration);

// POST /api/registrations/rsvp
router.post('/rsvp', createRsvpConfirmation);

// GET /api/registrations/walk-in
router.get('/walk-in', getWalkInRegistrations);

// GET /api/registrations/stats
router.get('/stats', getStats);

export default router;