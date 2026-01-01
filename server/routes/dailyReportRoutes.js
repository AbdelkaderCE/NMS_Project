import express from 'express';
import {
  createOrUpdateDailyReport,
  getAllDailyReports,
  getDailyReportById,
  getTodayReport,
  completeDailyReport,
  sendDailyReport,
  deleteDailyReport,
} from '../controllers/dailyReportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create or update daily report
router.post('/', createOrUpdateDailyReport);

// Get all daily reports (with filters)
router.get('/', getAllDailyReports);

// Get today's report for a specific child
router.get('/child/:childId/today', getTodayReport);

// Get single daily report by ID
router.get('/:id', getDailyReportById);

// Complete daily report
router.put('/:id/complete', completeDailyReport);

// Send daily report to parents
router.post('/:id/send', sendDailyReport);

// Delete daily report
router.delete('/:id', deleteDailyReport);

export default router;
