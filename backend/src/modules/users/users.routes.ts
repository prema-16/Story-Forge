import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  setup2FA,
  enable2FA,
  disable2FA,
  createApiKey,
  revokeApiKey,
} from './users.controller';
import { protect } from '../../middleware/authMiddleware';

const router = Router();

router.use(protect);

/**
 * @openapi
 * /users/profile:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Users]
 *   patch:
 *     summary: Update profile preferences, bio, username, avatar
 *     tags: [Users]
 */
router.route('/profile').get(getProfile).patch(updateProfile);

/** 2FA Management */
router.post('/2fa/setup', setup2FA);
router.post('/2fa/enable', enable2FA);
router.post('/2fa/disable', disable2FA);

/** API Key Management */
router.post('/api-keys', createApiKey);
router.delete('/api-keys/:keyId', revokeApiKey);

export default router;
