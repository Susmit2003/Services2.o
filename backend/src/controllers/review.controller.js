import Review from '../models/review.model.js';
import Service from '../models/service.model.js';
import User from '../models/user.model.js';
import Booking from '../models/booking.model.js';

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
const updateServiceRating = async (serviceId, oldRating = 0, newRating = 0, action = 'add') => {
  const service = await Service.findById(serviceId);
  if (!service) return;
  
  let newRatingSum = service.ratingSum;
  let newTotalReviews = service.totalReviews;
  
  switch (action) {
    case 'add':
      newRatingSum += newRating;
      newTotalReviews += 1;
      break;
    case 'update':
      newRatingSum = newRatingSum - oldRating + newRating;
      break;
    case 'delete':
      newRatingSum -= oldRating;
      newTotalReviews -= 1;
      break;
  }
  
  const newRatingAvg = newTotalReviews > 0 ? Math.round((newRatingSum / newTotalReviews) * 10) / 10 : 0;
  
  await Service.findByIdAndUpdate(serviceId, {
    ratingSum: newRatingSum,
    totalReviews: newTotalReviews,
    ratingAvg: newRatingAvg
  });
};

export const addReview = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { serviceId, rating, comment } = req.body;

    // Validate input
    const validationErrors = validateReviewInput({ serviceId, rating, comment });
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if user has already reviewed this service
    const existingReview = await Review.findOne({
      user: req.user.id,
      service: serviceId
    });

    if (existingReview) {
      return res.status(409).json({ message: 'You have already reviewed this service' });
    }

    // Check if user has booked and completed this service
    const booking = await Booking.findOne({
      user: req.user.id,
      service: serviceId,
      status: 'completed'
    });

    if (!booking) {
      return res.status(403).json({ message: 'You can only review services you have completed' });
    }

    // Create review
    const review = new Review({
      user: req.user.id,
      service: serviceId,
      rating,
      comment
    });

    const savedReview = await review.save();

    // Update service rating efficiently
    await updateServiceRating(serviceId, 0, rating, 'add');

    // Populate user data
    await savedReview.populate('user', 'name');

    // Transform response
    const transformedReview = {
      id: savedReview._id,
      serviceId: savedReview.service,
      userId: savedReview.user._id,
      userName: savedReview.user.name,
      rating: savedReview.rating,
      comment: savedReview.comment,
      createdAt: savedReview.createdAt
    };

    res.status(201).json({
      message: 'Review added successfully',
      review: transformedReview
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to add review'
    });
  }
};

export const getReviewsForService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const reviews = await Review.find({ service: serviceId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance

    // Transform data to match frontend expectations
    const transformedReviews = reviews.map(review => ({
      id: review._id,
      serviceId: review.service,
      userId: review.user._id,
      userName: review.user.name,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt
    }));

    res.json(transformedReviews);
  } catch (error) {
    console.error('Get reviews for service error:', error);
    res.status(500).json({ 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch reviews'
    });
  }
};

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