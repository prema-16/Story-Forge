import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProject,
  deleteProject,
  duplicateProject,
  saveCustomScript,
  generateScript,
  generateScenes,
  generatePrompts,
  generateVoice,
  generateThumbnail,
  generateSEO,
  renderVideo,
  getJobStatusHandler,
} from '../controllers/projectsController';
import { protect, requireCredits } from '../middleware/authMiddleware';

const router = Router();

// All project routes require authentication
router.use(protect);

// CRUD
router.route('/').get(getProjects).post(createProject);
router.route('/:id').get(getProject).delete(deleteProject);
router.post('/:id/duplicate', duplicateProject);
router.post('/:id/script', saveCustomScript);

// AI Generation Steps (async — returns 202 with jobId)
router.post('/:id/generate-script',    requireCredits(5),  generateScript);
router.post('/:id/generate-scenes',    requireCredits(3),  generateScenes);
router.post('/:id/generate-prompts',   requireCredits(3),  generatePrompts);
router.post('/:id/generate-voice',     requireCredits(10), generateVoice);
router.post('/:id/generate-thumbnail', requireCredits(8),  generateThumbnail);
router.post('/:id/generate-seo',       requireCredits(2),  generateSEO);
router.post('/:id/render',             requireCredits(4),  renderVideo);

// Job status polling
router.get('/:id/job/:jobId', getJobStatusHandler);

export default router;
