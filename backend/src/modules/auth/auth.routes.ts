import { Router } from 'express';
import {
  register,
  login,
  refresh,
  oauthCallback,
  requestMagicLink,
  verifyMagicLink,
  forgotPassword,
  resetPassword,
} from './auth.controller';
import { protect } from '../../middleware/authMiddleware';
import { logout, logoutAll, getMe, getSessions, revokeSession } from '../../controllers/authController';

const router = Router();

// ─── Public Auth Routes ───────────────────────────────────────────────────────

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: Jane Doe }
 *               email: { type: string, format: email, example: jane@example.com }
 *               password: { type: string, format: password, example: Password#123 }
 *     responses:
 *       201: { description: Registration successful }
 *       400: { description: Validation error }
 *       409: { description: Email already exists }
 */
router.post('/register', register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate user credentials
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *               rememberMe: { type: boolean }
 *               totpCode: { type: string, example: "123456" }
 *     responses:
 *       200: { description: Login successful or 2FA required }
 *       401: { description: Invalid credentials }
 *       423: { description: Account locked out }
 */
router.post('/login', login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Rotate refresh token and issue new token pair
 *     tags: [Authentication]
 *     responses:
 *       200: { description: Token refreshed }
 *       401: { description: Token expired or revoked }
 */
router.post('/refresh', refresh);

/**
 * @openapi
 * /auth/oauth/callback:
 *   post:
 *     summary: Exchange OAuth authorization code for login or account link
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [provider, code]
 *             properties:
 *               provider: { type: string, enum: [google, github, microsoft] }
 *               code: { type: string }
 *     responses:
 *       200: { description: OAuth login successful }
 */
router.post('/oauth/callback', oauthCallback);

router.post('/magic-link/request', requestMagicLink);
router.post('/magic-link/verify', verifyMagicLink);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ─── Protected Auth Routes ────────────────────────────────────────────────────
router.use(protect);

router.get('/me', getMe);
router.post('/logout', logout);
router.post('/logout-all', logoutAll);
router.get('/sessions', getSessions);
router.delete('/sessions/:tokenId', revokeSession);

export default router;
