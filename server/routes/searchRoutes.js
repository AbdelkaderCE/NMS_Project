import express from 'express';
import { universalSearch } from '../controllers/searchController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Universal search endpoint
router.get('/', protect, universalSearch);

export default router;
