import express from 'express';
import {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    getProviderServices,
    updateServiceStatus,
} from '../controllers/service.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// --- Public Routes ---
// Anyone can view all services or a single service by its ID.
router.get('/', getAllServices);
router.get('/:id', getServiceById);


// --- Private / Protected Routes ---
// A user must be logged in to access these routes.

// Route for a provider to get a list of their own services.
router.get('/provider/my-services', protect, getProviderServices);

// Route for a provider to update the status of one of their services.
router.post('/provider/my-services', protect, getProviderServices);


// Route for a provider to create a new service.
router.post('/create', protect, createService);

// Route for a provider to update the status of one of their services.
router.patch('/:id/status', protect, updateServiceStatus);

// Route for a provider to perform a full update on one of their services.
router.put('/:id', protect, updateService);

// Route for a provider to delete one of their services.
router.delete('/:id', protect, deleteService);

export default router;