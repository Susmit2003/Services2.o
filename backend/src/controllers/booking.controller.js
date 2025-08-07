import asyncHandler from 'express-async-handler';
import Booking from '../models/booking.model.js';
import Service from '../models/service.model.js';
import User from '../models/user.model.js';
import Transaction from '../models/transaction.model.js';
import { createNotification } from './notification.controller.js';
import crypto from 'crypto';

// --- Constants ---
const CANCELLATION_FEE_TO_PROVIDER = 15;
const PROVIDER_PLATFORM_FEE_PERCENTAGE = 0.10;

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings/create
 * @access  Private
 */
export const createBooking = asyncHandler(async (req, res) => {
    const {
        serviceId,
        bookingDate,
        timeSlot,
        address
    } = req.body;
    const userId = req.user._id;

    if (!serviceId || !bookingDate || !timeSlot || !address) {
        res.status(400);
        throw new Error('Missing required booking information.');
    }

    const service = await Service.findById(serviceId);
    if (!service) {
        res.status(404);
        throw new Error('Service not found.');
    }
    if (service.status !== 'Active') {
        res.status(400);
        throw new Error('This service is currently unavailable for booking.');
    }
    if (service.providerId.toString() === userId.toString()) {
        res.status(400);
        throw new Error('Providers cannot book their own services.');
    }

    const existingBooking = await Booking.findOne({
        service: serviceId,
        bookingDate: new Date(bookingDate),
        timeSlot,
        status: { $in: ['pending', 'confirmed', 'in-progress'] }
    });

    if (existingBooking) {
        res.status(409); // Conflict
        throw new Error('This time slot is already booked for the selected date.');
    }

    const booking = new Booking({
        user: userId,
        service: serviceId,
        provider: service.providerId,
        bookingDate: new Date(bookingDate),
        timeSlot,
        totalPrice: service.price,
        address,
        status: 'pending',
    });

    const createdBooking = await booking.save();

    await createNotification(
        service.providerId,
        'New Booking Request',
        `${req.user.name} has requested your service: "${service.title}".`,
        'booking', {
            relatedBooking: createdBooking._id
        }
    );

    res.status(201).json(createdBooking);
});

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
 * @desc    Allows a user to cancel their booking
 * @route   POST /api/bookings/:bookingId/cancel-user
 * @access  Private (User)
 */
export const cancelBookingAsUser = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { feePaid } = req.body;
  const booking = await Booking.findById(bookingId).populate('provider').populate('service', 'title');

  if (!booking) {
    res.status(404); throw new Error('Booking not found');
  }
  if (booking.user.toString() !== req.user.id) {
    res.status(403); throw new Error('Not authorized to cancel this booking');
  }
  if (booking.status === 'cancelled') {
    return res.status(400).json({ message: 'Booking is already cancelled.' });
  }
  if (!['confirmed', 'in-progress'].includes(booking.status)) {
    return res.status(400).json({ message: 'Only confirmed or in-progress bookings can be cancelled.' });
  }
  if (!feePaid) {
    res.status(402); throw new Error('Cancellation fee is required.');
  }

  await User.findByIdAndUpdate(booking.provider._id, { $inc: { walletBalance: CANCELLATION_FEE_TO_PROVIDER } });
  
  await Transaction.create({
    user: booking.provider._id,
    type: 'cancellation_fee_credit',
    amount: CANCELLATION_FEE_TO_PROVIDER,
    currency: booking.provider.currency,
    description: `Fee from cancelled booking #${bookingId.slice(-6)}`,
    relatedBooking: bookingId,
  });

  booking.status = 'cancelled';
  booking.cancelledBy = 'user';
  booking.cancelledAt = new Date();
  const updatedBooking = await booking.save();

  await createNotification(
    booking.provider._id,
    'Booking Cancelled',
    `${req.user.name} cancelled booking for "${booking.service.title}".`,
    'booking'
  );

  res.json({ message: 'Booking cancelled.', booking: updatedBooking });
});

/**
 * @desc    Provider accepts a booking request
 * @route   PUT /api/bookings/:bookingId/accept
 * @access  Private (Provider)
 */
export const acceptBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const provider = req.user;

    const booking = await Booking.findById(bookingId).populate('user').populate('service', 'title price');
    if (!booking) {
        res.status(404); throw new Error('Booking not found');
    }
    if (booking.provider.toString() !== provider._id.toString()) {
        res.status(403); throw new Error('Not authorized');
    }
    if (booking.status !== 'pending') {
        res.status(400); throw new Error('Booking is not pending');
    }

    const platformFee = booking.service.price * PROVIDER_PLATFORM_FEE_PERCENTAGE;

    if (provider.monthlyFreeBookings > 0) {
        await User.findByIdAndUpdate(provider._id, { $inc: { monthlyFreeBookings: -1 } });
    } else if (provider.walletBalance < platformFee) {
        res.status(402); throw new Error('Insufficient wallet balance for platform fee.');
    } else {
        await User.findByIdAndUpdate(provider._id, { $inc: { walletBalance: -platformFee } });
        await Transaction.create({
            user: provider._id, type: 'booking_fee', amount: -platformFee,
            description: `Platform fee for booking #${bookingId.slice(-6)}`,
            relatedBooking: bookingId, currency: provider.currency
        });
    }
    
    booking.status = 'confirmed';
    booking.serviceVerificationCode = crypto.randomInt(100000, 999999).toString();
    const updatedBooking = await booking.save();
    
    await createNotification(booking.user._id, 'Booking Confirmed!', `Your booking for "${booking.service.title}" has been confirmed.`, 'booking');

    res.json(updatedBooking);
});

/**
 * @desc    Provider declines a booking request
 * @route   PUT /api/bookings/:bookingId/decline
 * @access  Private (Provider)
 */
export const declineBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId).populate('user').populate('service', 'title');

    if (!booking) {
        res.status(404); throw new Error('Booking not found');
    }
    if (booking.provider.toString() !== req.user._id.toString()) {
        res.status(403); throw new Error('You are not authorized to decline this booking.');
    }
    if (booking.status !== 'pending') {
        res.status(400); throw new Error('Only pending bookings can be declined.');
    }

    booking.status = 'rejected';
    if(reason) {
        booking.providerNotes = `Declined: ${reason}`;
    }
    const updatedBooking = await booking.save();

    await createNotification(
        booking.user._id, 
        'Booking Declined', 
        `Unfortunately, your booking for "${booking.service.title}" was declined by the provider.`, 
        'booking'
    );

    res.json(updatedBooking);
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
 * @desc    Provider completes a service
 * @route   PUT /api/bookings/:bookingId/complete
 * @access  Private (Provider)
 */
export const completeService = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate('user').populate('service', 'title');

    if (!booking) {
        res.status(404); throw new Error('Booking not found');
    }
    if (booking.provider.toString() !== req.user._id.toString()) {
        res.status(403); throw new Error('You are not authorized to complete this service.');
    }
    if (booking.status !== 'in-progress') {
        res.status(400); throw new Error('Service must be "in-progress" to be marked as complete.');
    }

    booking.status = 'completed';
    const updatedBooking = await booking.save();

    await Service.findByIdAndUpdate(booking.service._id, { $inc: { totalBookings: 1 } });

    await createNotification(
        booking.user._id, 
        'Service Completed!', 
        `Your service "${booking.service.title}" is complete. Please take a moment to leave a review.`, 
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