import { Router } from 'express';
import { createOrg, getMyOrgs, inviteMember, acceptInviteToken } from './organizations.controller';
import { protect } from '../../middleware/authMiddleware';

const router = Router();

router.use(protect);

/**
 * @openapi
 * /organizations:
 *   get:
 *     summary: Get organizations for current user
 *     tags: [Organizations]
 *   post:
 *     summary: Create a new organization
 *     tags: [Organizations]
 */
router.route('/').get(getMyOrgs).post(createOrg);

router.post('/invites', inviteMember);
router.post('/invites/accept', acceptInviteToken);

export default router;
