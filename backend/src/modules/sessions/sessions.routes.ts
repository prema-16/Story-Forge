import { Router } from 'express';
import { listSessions, revokeSession, revokeAllSessions } from './sessions.controller';
import { protect } from '../../middleware/authMiddleware';

const router = Router();

router.use(protect);

/**
 * @openapi
 * /sessions:
 *   get:
 *     summary: List active login sessions for current user across all devices
 *     tags: [Sessions]
 *   delete:
 *     summary: Revoke all other device sessions
 *     tags: [Sessions]
 */
router.route('/').get(listSessions).delete(revokeAllSessions);
router.delete('/:tokenId', revokeSession);

export default router;
