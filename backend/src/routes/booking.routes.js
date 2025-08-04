import express from 'express';
import { 
  createBooking, 
  getUserBookings, 
  getProviderBookings,
  updateBookingStatus,
  getUnavailableSlots
} from '../controllers/booking.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// POST /api/bookings/create
router.post('/create', createBooking);

// GET /api/bookings/user
router.get('/user', getUserBookings);

// GET /api/bookings/provider
router.get('/provider', getProviderBookings);

// PUT /api/bookings/:bookingId/status
router.put('/:bookingId/status', updateBookingStatus);

// GET /api/bookings/unavailable-slots
router.get('/unavailable-slots', getUnavailableSlots);

export default router;