import { Router } from 'express';
import { createTeam, getOrgTeams, addTeamMember } from './teams.controller';
import { protect } from '../../middleware/authMiddleware';

const router = Router();

router.use(protect);

/**
 * @openapi
 * /teams:
 *   post:
 *     summary: Create a project team workspace
 *     tags: [Teams]
 */
router.post('/', createTeam);
router.get('/organization/:orgId', getOrgTeams);
router.post('/:teamId/members', addTeamMember);

export default router;
