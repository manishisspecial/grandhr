import express from 'express';
import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  getMyReviews,
} from '../controllers/review.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticate, authorize('ADMIN', 'HR', 'MANAGER'), createReview);
router.get('/', authenticate, getReviews);
router.get('/my-reviews', authenticate, getMyReviews);
router.get('/:id', authenticate, getReviewById);
router.put('/:id', authenticate, updateReview);

export default router;

