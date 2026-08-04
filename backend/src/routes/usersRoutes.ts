import { Router } from 'express';
import { updateProfile, getCredits } from '../controllers/usersController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All user routes require authentication
router.use(protect);

/**
 * @openapi
 * /users/profile:
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100 }
 *               avatar: { type: string, format: uri }
 *     responses:
 *       200: { description: Profile updated }
 *       400: { description: Validation error }
 *       401: { description: Unauthorized }
 */
router.patch('/profile', updateProfile);

/**
 * @openapi
 * /users/me/credits:
 *   get:
 *     summary: Get current user credit balance
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Credit balance }
 */
router.get('/me/credits', getCredits);

export default router;
