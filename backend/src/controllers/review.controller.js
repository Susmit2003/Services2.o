import asyncHandler from 'express-async-handler';
import Review from '../models/review.model.js';
import Service from '../models/service.model.js';
import User from '../models/user.model.js';
import Booking from '../models/booking.model.js';
import { createNotification } from './notification.controller.js';

// Validation helper
const validateReviewInput = (data) => {
  const errors = [];
  
  if (!data.serviceId) errors.push('Service ID is required');
  if (!data.rating) errors.push('Rating is required');
  if (!data.comment) errors.push('Comment is required');
  
  if (data.rating && (data.rating < 1 || data.rating > 5)) {
    errors.push('Rating must be between 1 and 5');
  }
  
  return errors;
};

// Helper to update service rating efficiently



export const getUserReviews = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const reviews = await Review.find({ user: req.user.id })
      .populate('service', 'title category')
      .sort({ createdAt: -1 })
      .lean();

    // Transform data to match frontend expectations
    const transformedReviews = reviews.map(review => ({
      id: review._id,
      serviceId: review.service._id,
      serviceName: review.service.title,
      serviceCategory: review.service.category,
      userId: review.user,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt
    }));

    res.json(transformedReviews);
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch user reviews'
    });
  }
};

export const updateReview = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { rating, comment } = req.body;
    const { reviewId } = req.params;

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    const oldRating = review.rating;

    // Update review
    const updateFields = {};
    if (rating !== undefined) updateFields.rating = rating;
    if (comment !== undefined) updateFields.comment = comment;

    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      updateFields,
      { new: true, runValidators: true }
    ).populate('user', 'name');

    // Update service rating efficiently if rating was changed
    if (rating !== undefined && rating !== oldRating) {
      await updateServiceRating(review.service, oldRating, rating, 'update');
    }

    // Transform response
    const transformedReview = {
      id: updatedReview._id,
      serviceId: updatedReview.service,
      userId: updatedReview.user._id,
      userName: updatedReview.user.name,
      rating: updatedReview.rating,
      comment: updatedReview.comment,
      createdAt: updatedReview.createdAt
    };

    res.json({
      message: 'Review updated successfully',
      review: transformedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to update review'
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    // Update service rating efficiently before deleting
    await updateServiceRating(review.service, review.rating, 0, 'delete');

    // Delete review
    await Review.findByIdAndDelete(reviewId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to delete review'
    });
  }
};



const updateServiceRating = async (serviceId, rating) => {
  const service = await Service.findById(serviceId);
  if (!service) return;

  const newTotalReviews = service.totalReviews + 1;
  const newRatingSum = service.ratingSum + rating;
  const newRatingAvg = Math.round((newRatingSum / newTotalReviews) * 10) / 10;

  await Service.findByIdAndUpdate(serviceId, {
    totalReviews: newTotalReviews,
    ratingSum: newRatingSum,
    ratingAvg: newRatingAvg,
  });
};


export const getReviewsForService = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const reviews = await Review.find({ service: serviceId })
    .populate('user', 'name profileImage')
    .sort({ createdAt: -1 })
    .limit(20);
    
  res.json(reviews);
});





/**
 * @desc    Add a new review for a booking
 * @route   POST /api/reviews/add
 * @access  Private (User)
 */
export const addReview = asyncHandler(async (req, res) => {
    const { bookingId, rating, comment } = req.body;
    const user = req.user;

    const booking = await Booking.findById(bookingId).populate('provider');
    if (!booking) {
        res.status(404); throw new Error('Booking not found.');
    }
    if (booking.user.toString() !== user._id.toString()) {
        res.status(403); throw new Error('You can only review your own bookings.');
    }
    if (booking.status !== 'completed') {
        res.status(400); throw new Error('You can only review completed services.');
    }
    if (booking.review) {
        res.status(400); throw new Error('This service has already been reviewed.');
    }

    // 1. Create the new review
    const review = await Review.create({
        user: user._id,
        service: booking.service,
        booking: bookingId,
        rating,
        comment
    });

    // 2. Link the review to the booking
    booking.review = review._id;
    booking.userFeedback = { stars: rating, text: comment };
    await booking.save();

    // 3. Update the service's average rating atomically
    const service = await Service.findById(booking.service);
    if (service) {
        service.ratingSum += rating;
        service.totalReviews += 1;
        service.ratingAvg = service.ratingSum / service.totalReviews;
        await service.save();
    }
    
    // 4. Notify the provider
    await createNotification(
        booking.provider._id,
        "You've received a new review!",
        `${user.name} left a ${rating}-star review for your service: "${booking.serviceTitle}".`,
        'review'
    );

    res.status(201).json({ message: 'Review added successfully!' });
});

/**
 * @desc    Get all reviews for a provider's services
 * @route   GET /api/reviews/provider
 * @access  Private (Provider)
 */
export const getProviderFeedback = asyncHandler(async (req, res) => {
    const providerId = req.user._id;

    // Find all services offered by the provider
    const services = await Service.find({ providerId: providerId }).select('_id');
    const serviceIds = services.map(s => s._id);

    // Find all reviews for those services
    const reviews = await Review.find({ service: { $in: serviceIds } })
        .populate('user', 'name profileImage')
        .populate('service', 'title')
        .sort({ createdAt: -1 });
        
    res.json(reviews);
});