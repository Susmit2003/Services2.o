import express from 'express';
import { 
  createBooking, 
  getUserBookings, 
  getProviderBookings,
  getUnavailableSlots,
  cancelBookingAsUser,
  acceptBooking,
  declineBooking,
  verifyAndStartService,
  completeService,
  markAsIncomplete,
  addProviderFeedback,
} from '../controllers/booking.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes below require an authenticated user
router.use(protect);

// --- Publicly accessible after auth ---
router.get('/unavailable-slots', getUnavailableSlots);

// --- User-specific routes ---
router.get('/user', getUserBookings);
router.post('/create', createBooking);
router.post('/:bookingId/cancel-user', cancelBookingAsUser);

// --- Provider-specific routes ---
router.get('/provider', getProviderBookings);
router.put('/:bookingId/accept', acceptBooking);
router.put('/:bookingId/decline', declineBooking);
router.put('/:bookingId/start', verifyAndStartService);
router.put('/:bookingId/complete', completeService);
router.put('/:bookingId/incomplete', markAsIncomplete);
router.post('/:bookingId/provider-feedback', addProviderFeedback);

export default router;