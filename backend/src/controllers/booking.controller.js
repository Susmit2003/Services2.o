import asyncHandler from 'express-async-handler';
import Booking from '../models/booking.model.js'; // <-- This line fixes the "Booking is not defined" error
import Service from '../models/service.model.js';
import User from '../models/user.model.js';
import Transaction from '../models/transaction.model.js';
import { createNotification } from './notification.controller.js';
import crypto from 'crypto';

// --- Fee Constants ---
const PLATFORM_FEE_PERCENTAGE = 0.10; // 10%
const CANCELLATION_FEE = 20;
const CANCELLATION_FEE_TO_PROVIDER = 15;
const CANCELLATION_FEE_TO_PLATFORM = 5;

// --- CREATE BOOKING ---
export const createBooking = asyncHandler(async (req, res) => {
  const { serviceId, bookingDate, timeSlot, address, totalPrice, currency } = req.body;
  const user = req.user;

  if (!address || !address.line1 || !address.city || !address.pinCode) {
      res.status(400);
      throw new Error("A complete address is required to create a booking.");
  }

  const service = await Service.findById(serviceId);
  if (!service) { res.status(404); throw new Error('Service not found'); }
  
  const booking = await Booking.create({
    user: user._id,
    service: serviceId,
    provider: service.providerId,
    bookingDate,
    timeSlot,
    totalPrice,
    currency,
    address,
  });

  await createNotification(
    service.providerId,
    'New Booking Request',
    `${user.name} has requested your service: "${service.title}".`,
    'booking'
  );

  res.status(201).json(booking);
});

// --- ACCEPT BOOKING (WITH FEE LOGIC) ---
export const acceptBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const provider = req.user;

    const booking = await Booking.findById(bookingId).populate('user service');
    if (!booking || booking.provider.toString() !== provider._id.toString() || booking.status !== 'pending') {
        res.status(400); throw new Error('Invalid booking or action not allowed.');
    }

    // --- THIS IS THE FIX ---
    // The logic is now correctly structured to handle free credits first.

    // Check for free bookings first.
    if (provider.monthlyFreeBookings > 0) {
        // If they have free credits, deduct one.
        await User.findByIdAndUpdate(provider._id, { $inc: { monthlyFreeBookings: -1 } });
    } else {
        // If they have NO free credits, then proceed with the platform fee.
        const platformFee = booking.totalPrice * PLATFORM_FEE_PERCENTAGE;

        // Check for sufficient wallet balance.
        if (provider.walletBalance < platformFee) {
            res.status(402); // Payment Required
            throw new Error(`Insufficient balance. You need ₹${platformFee.toFixed(2)} to accept this booking. Please recharge your wallet.`);
        }

        // If balance is sufficient, deduct the fee from the provider's wallet.
        await User.findByIdAndUpdate(provider._id, { $inc: { walletBalance: -platformFee } });

        // Log the platform fee transaction for the provider's records.
        await Transaction.create({
            user: provider._id,
            type: 'booking_fee',
            amount: -platformFee,
            description: `10% platform fee for booking #${bookingId.slice(-6)}`,
            relatedBooking: bookingId,
            currency: provider.currency
        });
    }
    // --- End of FIX ---
    
    // Once the fee/credit logic is handled, confirm the booking.
    booking.status = 'confirmed';
    booking.serviceVerificationCode = crypto.randomInt(100000, 999999).toString();
    const updatedBooking = await booking.save();
    
    // Notify the customer that their booking has been accepted.
    await createNotification(booking.user._id, 'Booking Confirmed!', `Your booking for "${booking.service.title}" has been confirmed.`, 'booking');
    
    res.json(updatedBooking);
});








// --- REJECT BOOKING ---
export const declineBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId).populate('user service');
    if (!booking || booking.provider.toString() !== req.user._id.toString() || booking.status !== 'pending') {
        res.status(400); throw new Error('Invalid booking or action not allowed.');
    }

    booking.status = 'rejected';
    if (reason) booking.providerNotes = `Declined: ${reason}`;
    const updatedBooking = await booking.save();
    await createNotification(booking.user._id, 'Booking Declined', `Your booking for "${booking.service.title}" was declined.`, 'booking');
    
    res.json(updatedBooking);
});

// --- CANCEL BOOKING (WITH FEE LOGIC) ---
export const cancelBookingAsUser = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const user = req.user;
  
  const booking = await Booking.findById(bookingId).populate('provider service');
  if (!booking || booking.user.toString() !== user._id.toString() || booking.status !== 'confirmed') {
      res.status(400); throw new Error('Only confirmed bookings can be cancelled.');
  }

  if (user.walletBalance < CANCELLATION_FEE) {
      res.status(402);
      throw new Error(`Insufficient balance. You need ₹${CANCELLATION_FEE} to cancel.`);
  }

  await User.findByIdAndUpdate(user._id, { $inc: { walletBalance: -CANCELLATION_FEE } });
  await Transaction.create({
    user: user._id, type: 'cancellation_fee_debit', amount: -CANCELLATION_FEE,
    description: `Cancellation fee for booking #${bookingId.slice(-6)}`,
    relatedBooking: bookingId, currency: user.currency,
  });

  await User.findByIdAndUpdate(booking.provider._id, { $inc: { walletBalance: CANCELLATION_FEE_TO_PROVIDER } });
  await Transaction.create({
    user: booking.provider._id, type: 'cancellation_fee_credit', amount: CANCELLATION_FEE_TO_PROVIDER,
    description: `Fee from cancelled booking #${bookingId.slice(-6)}`,
    relatedBooking: bookingId, currency: booking.provider.currency,
  });

  console.log(`Platform earned ₹${CANCELLATION_FEE_TO_PLATFORM} from cancellation of booking ${bookingId}`);

  booking.status = 'cancelled';
  booking.cancelledBy = 'user';
  booking.cancelledAt = new Date();
  const updatedBooking = await booking.save();
  
  await createNotification(booking.provider._id, 'Booking Cancelled', `${user.name} cancelled their booking.`, 'booking');
  
  res.json({ message: 'Booking cancelled successfully.', booking: updatedBooking });
});








// --- Constants ---

const PROVIDER_PLATFORM_FEE_PERCENTAGE = 0.10;


/**
 * @desc    Get bookings for the logged-in user
 * @route   GET /api/bookings/user
 * @access  Private
 */
export const getUserBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
        .populate('service', 'title images')
        .populate('provider', 'name')
        .sort({ createdAt: -1 });

    const transformedBookings = bookings.map(b => ({
        id: b._id,
        serviceId: b.service?._id,
        serviceTitle: b.service?.title,
        serviceImages: b.service?.images,
        providerName: b.provider?.name,
        bookingDate: b.bookingDate,
        timeSlot: b.timeSlot,
        status: b.status,
        totalPrice: b.totalPrice,
        address: b.address,
        currency: b.currency,
        paymentStatus: b.paymentStatus,
        serviceVerificationCode: b.serviceVerificationCode,
        userFeedback: b.userFeedback,
        providerFeedback: b.providerFeedback,
        cancelledBy: b.cancelledBy,
        cancelledAt: b.cancelledAt,
        createdAt: b.createdAt
    }));
    
    res.json(transformedBookings);
});

/**
 * @desc    Get bookings for the logged-in provider
 * @route   GET /api/bookings/provider
 * @access  Private
 */
export const getProviderBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ provider: req.user._id })
        .populate('service', 'title')
        .populate('user', 'name')
        .sort({ createdAt: -1 });

    const transformedBookings = bookings.map(b => ({
        id: b._id,
        serviceId: b.service?._id,
        serviceTitle: b.service?.title,
        bookedByUserName: b.user?.name,
        bookingDate: b.bookingDate,
        timeSlot: b.timeSlot,
        status: b.status,
        totalPrice: b.totalPrice,
        address: b.address,
        currency: b.currency,
        paymentStatus: b.paymentStatus,
        serviceVerificationCode: b.serviceVerificationCode,
        userFeedback: b.userFeedback,
        providerFeedback: b.providerFeedback,
        cancelledBy: b.cancelledBy,
        cancelledAt: b.cancelledAt,
        createdAt: b.createdAt
    }));

    res.json(transformedBookings);
});

/**
 * @desc    Get unavailable slots for a service on a given date
 * @route   GET /api/bookings/unavailable-slots
 * @access  Public
 */
export const getUnavailableSlots = asyncHandler(async (req, res) => {
    const { serviceId, date } = req.query;
    if (!serviceId || !date) {
        res.status(400);
        throw new Error('Service ID and date are required');
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const bookings = await Booking.find({
        service: serviceId,
        bookingDate: { $gte: startDate, $lt: endDate },
        status: { $in: ['pending', 'confirmed', 'in-progress', 'completed'] }
    });

    const unavailableSlots = bookings.map(booking => booking.timeSlot);
    res.json(unavailableSlots);
});




/**
 * @desc    Provider starts a service with a verification code
 * @route   PUT /api/bookings/:bookingId/start
 * @access  Private (Provider)
 */
export const verifyAndStartService = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { verificationCode } = req.body;
    
    const booking = await Booking.findById(bookingId).populate('user').populate('service', 'title');

    if (!booking) {
        res.status(404); throw new Error('Booking not found');
    }
    if (booking.provider.toString() !== req.user._id.toString()) {
        res.status(403); throw new Error('You are not authorized to start this service.');
    }
    if (booking.status !== 'confirmed') {
        res.status(400); throw new Error('Booking must be in "confirmed" status to start.');
    }
    if (booking.serviceVerificationCode !== verificationCode) {
        res.status(400); throw new Error('The verification code is incorrect.');
    }

    booking.status = 'in-progress';
    const updatedBooking = await booking.save();

    await createNotification(
        booking.user._id, 
        'Service Started', 
        `Your service "${booking.service.title}" is now in progress.`, 
        'booking'
    );

    res.json(updatedBooking);
});



/**
 * @desc    Provider marks a service as incomplete
 * @route   PUT /api/bookings/:bookingId/incomplete
 * @access  Private (Provider)
 */
export const markAsIncomplete = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId).populate('user').populate('service', 'title');
    if (!booking) {
        res.status(404); throw new Error('Booking not found');
    }
    if (booking.provider.toString() !== req.user._id.toString()) {
        res.status(403); throw new Error('Not authorized');
    }
    if (booking.status !== 'in-progress') {
        res.status(400); throw new Error('Only in-progress services can be marked as incomplete.');
    }

    booking.status = 'incompleted';
    booking.incompletedAt = new Date();
    booking.providerNotes = `Marked incomplete: ${reason || 'No reason provided.'}`;
    const updatedBooking = await booking.save();

    await createNotification(
        booking.user._id, 
        'Service Incomplete', 
        `Your service "${booking.service.title}" was marked as incomplete by the provider.`, 
        'booking'
    );

    res.json(updatedBooking);
});

/**
 * @desc    Provider adds feedback for a user after a completed service
 * @route   POST /api/bookings/:bookingId/provider-feedback
 * @access  Private (Provider)
 */
export const addProviderFeedback = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { rating, reviewText } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
        res.status(400); throw new Error('A rating between 1 and 5 is required.');
    }

    const booking = await Booking.findById(bookingId).populate('user').populate('service', 'title');
    if (!booking) {
        res.status(404); throw new Error('Booking not found');
    }
    if (booking.provider.toString() !== req.user._id.toString()) {
        res.status(403); throw new Error('Not authorized to leave feedback on this booking.');
    }
    if (booking.status !== 'completed') {
        res.status(400); throw new Error('Feedback can only be left for completed bookings.');
    }
    if (booking.providerFeedback && booking.providerFeedback.stars) {
        res.status(400); throw new Error('You have already left feedback for this booking.');
    }

    booking.providerFeedback = { stars: rating, text: reviewText || '' };
    const updatedBooking = await booking.save();

    await createNotification(
        booking.user._id, 
        'New Feedback Received', 
        `${req.user.name} left you feedback for the service "${booking.service.title}".`, 
        'review'
    );

    res.json(updatedBooking);
});







// --- NEW FUNCTION: Complete Service with OTP Verification ---
export const completeService = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { verificationCode } = req.body;
    const provider = req.user;

    if (!verificationCode) {
        res.status(400);
        throw new Error("Verification code is required.");
    }

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.provider.toString() !== provider._id.toString()) {
        res.status(403);
        throw new Error("You are not authorized to complete this booking.");
    }
    if (booking.status !== 'confirmed') { // Or 'in-progress' if you add that state
        res.status(400);
        throw new Error("Booking must be in 'confirmed' state to be completed.");
    }
    if (booking.serviceVerificationCode !== verificationCode) {
        res.status(400);
        throw new Error("Invalid verification code.");
    }

    booking.status = 'completed';
    const updatedBooking = await booking.save();

    // Notify both users to rate each other
    await createNotification(booking.user, 'Service Completed!', `Please rate your experience with ${provider.name}.`, 'review');
    await createNotification(provider._id, 'Service Completed!', `Please rate your experience with the customer.`, 'review');

    res.json(updatedBooking);
});




