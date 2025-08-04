import express from 'express';
import { 
  addReview, 
  getReviewsForService, 
  getUserReviews,
  updateReview,
  deleteReview
} from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes
router.use(protect);

// POST /api/reviews/add
router.post('/add', addReview);

// GET /api/reviews/user/my-reviews - Must come before /:serviceId
router.get('/user/my-reviews', getUserReviews);

// PUT /api/reviews/:reviewId
router.put('/:reviewId', updateReview);

// DELETE /api/reviews/:reviewId
router.delete('/:reviewId', deleteReview);

// Public routes - Must come after specific routes
router.get('/:serviceId', getReviewsForService);

export default router;