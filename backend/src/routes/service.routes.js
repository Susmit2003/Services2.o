import express from 'express';
import { 
  getAllServices, 
  getServiceById, 
  createService, 
  updateService, 
  deleteService,
  getProviderServices
} from '../controllers/service.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllServices);

// Protected routes
router.use(protect);

// GET /api/services/provider/my-services - Must come before /:id
router.get('/provider/my-services', getProviderServices);

// POST /api/services/create
router.post('/create', createService);

// PUT /api/services/:id
router.put('/:id', updateService);

// DELETE /api/services/:id
router.delete('/:id', deleteService);

// GET /api/services/:id - Must come after specific routes
router.get('/:id', getServiceById);

export default router;