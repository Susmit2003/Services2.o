import Booking from '../models/booking.model.js';
import Service from '../models/service.model.js';
import User from '../models/user.model.js';

export const createBooking = async (req, res) => {
  try {
    const { serviceId, bookingDate, timeSlot, address } = req.body;

    // Validate required fields
    if (!serviceId || !bookingDate || !timeSlot || !address) {
      return res.status(400).json({ 
        message: 'Service ID, booking date, time slot, and address are required' 
      });
    }

    // Check if service exists and is active
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    if (service.status !== 'Active') {
      return res.status(400).json({ message: 'Service is not available for booking' });
    }

    // Check if user is trying to book their own service
    if (service.provider.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot book your own service' });
    }

    // Check if the time slot is available
    const existingBooking = await Booking.findOne({
      service: serviceId,
      bookingDate: new Date(bookingDate),
      timeSlot,
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Check user's daily booking limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await Booking.countDocuments({
      user: req.user.id,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    if (todayBookings >= 10) {
      return res.status(400).json({ message: 'Daily booking limit reached (10 bookings per day)' });
    }

    // Check if user has free transactions available
    const user = await User.findById(req.user.id);
    const isFreeTransaction = user.freeTransactionsUsed < 10;

    // Create booking
    const booking = new Booking({
      user: req.user.id,
      service: serviceId,
      provider: service.provider,
      bookingDate: new Date(bookingDate),
      timeSlot,
      totalPrice: service.price,
      address,
      isFreeTransaction
    });

    const savedBooking = await booking.save();

    // Update user's daily booking count and free transactions
    if (isFreeTransaction) {
      user.freeTransactionsUsed += 1;
    }
    user.dailyBookings = todayBookings + 1;
    user.lastBookingDate = new Date();
    await user.save();

    // Populate related data
    await savedBooking.populate([
      { path: 'service', select: 'title description category price images' },
      { path: 'provider', select: 'name email mobile' },
      { path: 'user', select: 'name email mobile' }
    ]);

    // Transform response
    const transformedBooking = {
      id: savedBooking._id,
      serviceId: savedBooking.service._id,
      service: {
        id: savedBooking.service._id,
        title: savedBooking.service.title,
        description: savedBooking.service.description,
        category: savedBooking.service.category,
        price: savedBooking.service.price,
        images: savedBooking.service.images
      },
      userId: savedBooking.user._id,
      providerId: savedBooking.provider._id,
      bookingDate: savedBooking.bookingDate,
      timeSlot: savedBooking.timeSlot,
      status: savedBooking.status,
      totalPrice: savedBooking.totalPrice,
      address: savedBooking.address,
      createdAt: savedBooking.createdAt,
      updatedAt: savedBooking.updatedAt
    };

    res.status(201).json({
      message: 'Booking created successfully',
      booking: transformedBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate([
        { path: 'service', select: 'title description category price images' },
        { path: 'provider', select: 'name email mobile' }
      ])
      .sort({ createdAt: -1 });

    // Transform data to match frontend expectations
    const transformedBookings = bookings.map(booking => ({
      id: booking._id,
      serviceId: booking.service._id,
      service: {
        id: booking.service._id,
        title: booking.service.title,
        description: booking.service.description,
        category: booking.service.category,
        price: booking.service.price,
        images: booking.service.images
      },
      userId: booking.user,
      providerId: booking.provider._id,
      bookingDate: booking.bookingDate,
      timeSlot: booking.timeSlot,
      status: booking.status,
      totalPrice: booking.totalPrice,
      address: booking.address,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }));

    res.json(transformedBookings);
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Failed to fetch user bookings' });
  }
};

export const getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.user.id })
      .populate([
        { path: 'service', select: 'title description category price images' },
        { path: 'user', select: 'name email mobile' }
      ])
      .sort({ createdAt: -1 });

    // Transform data to match frontend expectations
    const transformedBookings = bookings.map(booking => ({
      id: booking._id,
      serviceId: booking.service._id,
      service: {
        id: booking.service._id,
        title: booking.service.title,
        description: booking.service.description,
        category: booking.service.category,
        price: booking.service.price,
        images: booking.service.images
      },
      userId: booking.user._id,
      providerId: booking.provider,
      bookingDate: booking.bookingDate,
      timeSlot: booking.timeSlot,
      status: booking.status,
      totalPrice: booking.totalPrice,
      address: booking.address,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }));

    res.json(transformedBookings);
  } catch (error) {
    console.error('Get provider bookings error:', error);
    res.status(500).json({ message: 'Failed to fetch provider bookings' });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the provider of this booking
    if (booking.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    booking.status = status;
    await booking.save();

    res.json({ 
      message: 'Booking status updated successfully',
      booking: {
        id: booking._id,
        status: booking.status,
        updatedAt: booking.updatedAt
      }
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Failed to update booking status' });
  }
};

export const getUnavailableSlots = async (req, res) => {
  try {
    const { serviceId, date } = req.query;

    if (!serviceId || !date) {
      return res.status(400).json({ message: 'Service ID and date are required' });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const bookings = await Booking.find({
      service: serviceId,
      bookingDate: { $gte: startDate, $lt: endDate },
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    });

    const unavailableSlots = bookings.map(booking => booking.timeSlot);

    res.json(unavailableSlots);
  } catch (error) {
    console.error('Get unavailable slots error:', error);
    res.status(500).json({ message: 'Failed to fetch unavailable slots' });
  }
};