import express from 'express';
import * as ReviewController from '../controllers/reviewController.js';
import { verifyUserToken, verifyAdminToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:productId', ReviewController.getProductReviews);
router.post('/', verifyUserToken, ReviewController.addReview);
router.delete('/:id', verifyAdminToken, ReviewController.deleteReview); // Moderation

export default router;
