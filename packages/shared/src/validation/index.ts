/**
 * @storyforge/shared — Validation Schemas
 *
 * Zod schemas shared between frontend (form validation) and backend (request validation).
 * Changes here affect both simultaneously — no drift between client and server rules.
 */
import { z } from 'zod';
import {
  MAX_VIDEO_LENGTH,
  MIN_VIDEO_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
} from '../constants';

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z
    .string()
    .min(NAME_MIN_LENGTH, `Name must be at least ${NAME_MIN_LENGTH} characters`)
    .max(NAME_MAX_LENGTH, `Name must be at most ${NAME_MAX_LENGTH} characters`)
    .trim(),
  email: z.string().email('Enter a valid email address').toLowerCase(),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`),
});

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
  totpCode: z.string().length(6, 'TOTP code must be 6 digits').optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH).trim().optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .optional(),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  preferences: z
    .object({
      theme: z.enum(['dark', 'light', 'system']).optional(),
      language: z.string().optional(),
      timezone: z.string().optional(),
      emailNotifications: z
        .object({
          generationComplete: z.boolean().optional(),
          renderComplete: z.boolean().optional(),
          creditsLow: z.boolean().optional(),
          securityAlerts: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
      .max(PASSWORD_MAX_LENGTH),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address').toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
      .max(PASSWORD_MAX_LENGTH),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── 2FA & Security Schemas ───────────────────────────────────────────────────

export const verifyTotpSchema = z.object({
  code: z.string().length(6, 'TOTP code must be 6 digits'),
});

export const createApiKeySchema = z.object({
  name: z.string().min(1, 'Key name is required').max(50),
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

// ─── Organization & Team Schemas ──────────────────────────────────────────────

export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').max(100).trim(),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
});

export const createTeamSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  name: z.string().min(2, 'Team name must be at least 2 characters').max(50).trim(),
  description: z.string().max(200).optional(),
});

export const sendInviteSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  teamId: z.string().optional(),
  email: z.string().email('Enter a valid email address').toLowerCase(),
  role: z.enum(['owner', 'admin', 'member', 'guest', 'editor', 'viewer']).default('member'),
});

// ─── Project Schemas ──────────────────────────────────────────────────────────

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters')
    .trim(),
  idea: z
    .string()
    .min(10, 'Idea must be at least 10 characters')
    .max(5000, 'Idea must be at most 5000 characters')
    .trim(),
  genre: z.enum([
    'crime',
    'documentary',
    'history',
    'gaming',
    'education',
    'technology',
    'finance',
    'space',
    'mystery',
    'fantasy',
    'other',
  ]),
  videoLength: z
    .number()
    .int('Video length must be a whole number')
    .min(MIN_VIDEO_LENGTH, `Minimum video length is ${MIN_VIDEO_LENGTH} minute`)
    .max(MAX_VIDEO_LENGTH, `Maximum video length is ${MAX_VIDEO_LENGTH} minutes`),
  style: z.enum(['cinematic', 'documentary', 'vlog', 'animated', 'minimalist']),
  aspectRatio: z.enum(['16:9', '9:16', '1:1', '4:3']),
  language: z.string().min(2).max(10).default('en'),
  organizationId: z.string().optional(),
  teamId: z.string().optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  isFavorite: z.boolean().optional(),
});

// ─── Generation Schemas ───────────────────────────────────────────────────────

export const generateStepSchema = z.object({
  step: z.enum(['script', 'scenes', 'prompts', 'voice', 'thumbnail', 'seo']),
  options: z.record(z.unknown()).optional(),
});

export const renderSchema = z.object({
  quality: z.enum(['draft', 'standard', 'high']).default('standard'),
  includeSubtitles: z.boolean().default(true),
  includeVoiceover: z.boolean().default(true),
});

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyTotpInput = z.infer<typeof verifyTotpSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type SendInviteInput = z.infer<typeof sendInviteSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type GenerateStepInput = z.infer<typeof generateStepSchema>;
export type RenderInput = z.infer<typeof renderSchema>;
