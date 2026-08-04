import { Router } from 'express';
import {
  register,
  login,
  logout,
  logoutAll,
  refresh,
  getMe,
  getSessions,
  revokeSession,
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);

// ─── Protected Routes (require valid JWT) ────────────────────────────────────
router.use(protect);

router.get('/me', getMe);
router.post('/logout', logout);      // Protected: req.user available for audit log
router.post('/logout-all', logoutAll);
router.get('/sessions', getSessions);
router.delete('/sessions/:tokenId', revokeSession);

export default router;
