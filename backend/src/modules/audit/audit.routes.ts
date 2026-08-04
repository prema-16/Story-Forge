import { Router } from 'express';
import { getUserLogs, getOrgLogs } from './audit.controller';
import { protect } from '../../middleware/authMiddleware';

const router = Router();

router.use(protect);

/**
 * @openapi
 * /audit-logs:
 *   get:
 *     summary: Get audit security events for current user
 *     tags: [Audit]
 */
router.get('/', getUserLogs);
router.get('/organization/:orgId', getOrgLogs);

export default router;
