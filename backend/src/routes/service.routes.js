import express from 'express';
import {
    getAllServices,
    getServiceById,
    createService,
    getProviderServices,
    updateServiceStatus,
    archiveService,
} from '../controllers/service.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes that anyone can access
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// --- THIS IS THE FIX ---
// These routes are now only protected by the simple 'protect' middleware.
// Any logged-in user can now access them, which matches your new logic.
router.post('/create', protect, createService);
router.get('/provider/my-services', protect, getProviderServices);
router.patch('/:id/status', protect, updateServiceStatus);
router.delete('/:id', protect, archiveService);

export default router;