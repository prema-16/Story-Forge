import { Router } from 'express';
import { listUsers, toggleUserStatus, updateUserRole, getSystemAuditLogs } from './admin.controller';
import { protect, restrictTo } from '../../middleware/authMiddleware';

const router = Router();

// Admin routes restricted to admin & superadmin roles
router.use(protect);
router.use(restrictTo('admin', 'superadmin'));

/**
 * @openapi
 * /admin/users:
 *   get:
 *     summary: List all registered platform users with pagination and search
 *     tags: [Admin]
 */
router.get('/users', listUsers);
router.patch('/users/:userId/status', toggleUserStatus);
router.patch('/users/:userId/role', updateUserRole);
router.get('/audit-logs', getSystemAuditLogs);

export default router;
