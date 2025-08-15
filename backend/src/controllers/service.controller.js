import asyncHandler from 'express-async-handler';
import Service from '../models/service.model.js';
import User from '../models/user.model.js';
import { getCoordsForPincode } from '../utils/location.utils.js';

const getAllServices = asyncHandler(async (req, res) => {
  const { category, subcategory, search, pincode, rating } = req.query;
  
  const baseQuery = { status: 'Active' };

  // --- THE FIX: Make category and subcategory searches case-insensitive ---
  if (category) {
    // This creates a regular expression that matches the category string
    // exactly, but ignores the case (e.g., 'cleaner' will match 'Cleaner').
    baseQuery.category = new RegExp(`^${category}$`, 'i');
  }
  if (subcategory) {
    baseQuery.subCategory = new RegExp(`^${subcategory}$`, 'i');
  }
  // --- END OF FIX ---

  if (rating) baseQuery.ratingAvg = { $gte: Number(rating) };
  if (search) {
      baseQuery.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { providerName: { $regex: search, $options: 'i' } }
      ];
  }

  let finalServices = [];

  if (pincode) {
    const exactMatchQuery = { ...baseQuery, zipCodes: pincode };
    finalServices = await Service.find(exactMatchQuery).limit(50);

    if (finalServices.length === 0) {
      const coords = await getCoordsForPincode(pincode);
      if (coords) {
        const providersInRadius = await User.find({
          'location.coordinates': {
            $near: {
              $geometry: { type: 'Point', coordinates: [coords.longitude, coords.latitude] },
              $maxDistance: 10000,
            },
          },
        }).select('_id');

        const providerIds = providersInRadius.map(p => p._id);
        
        if (providerIds.length > 0) {
            const radiusQuery = { ...baseQuery, providerId: { $in: providerIds } };
            finalServices = await Service.find(radiusQuery).limit(50);
        }
      }
    }
  } else {
    finalServices = await Service.find(baseQuery).limit(50);
  }

  // The backend still sends categories, which is useful for other potential features.
  res.json({ services: finalServices });
});


// --- (The rest of the controller functions remain the same) ---

const getServiceById = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (service) { res.json(service); } 
    else { res.status(404); throw new Error('Service not found'); }
});

const getProviderServices = asyncHandler(async (req, res) => {
    const services = await Service.find({ providerId: req.user._id });
    res.json(services);
});

const createService = asyncHandler(async (req, res) => {
    const { title, description, category, subCategory, priceDisplay, images, zipCodes, timeSlots } = req.body;
    const provider = req.user;
    if (!provider) { res.status(401); throw new Error('Not authorized'); }
    const parsePrice = (priceStr) => {
        const numbers = (priceStr || '').match(/\d+(\.\d+)?/g);
        return numbers ? parseFloat(numbers[0]) : 0;
    };
    const service = new Service({
        providerId: provider._id, providerName: provider.name,
        title, description, category, subCategory, 
        price: parsePrice(priceDisplay),
        priceDisplay, images, zipCodes, timeSlots, status: 'Active'
    });
    const createdService = await service.save();
    res.status(201).json(createdService);
});

const updateServiceStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const service = await Service.findById(req.params.id);
  if (!service) { res.status(404); throw new Error('Service not found'); }
  if (service.providerId.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }
  if (!['Active', 'Inactive'].includes(status)) { res.status(400); throw new Error('Invalid status'); }
  service.status = status;
  const updatedService = await service.save();
  res.json(updatedService);
});

const deleteService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (!service) { res.status(404); throw new Error('Service not found'); }
    if (service.providerId.toString() !== req.user._id.toString()) { res.status(401); throw new Error('User not authorized'); }
    service.status = 'Archived';
    await service.save();
    res.status(200).json({ message: 'Service archived' });
});

const updateService = asyncHandler(async (req, res) => {
    res.status(403).json({ message: 'Editing services is disabled.' });
});


export const archiveService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (!service || service.providerId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this service');
    }
   
    service.status = 'Archived';
    await service.save();
    res.status(200).json({ message: 'Service archived successfully' });
});


export {
  getAllServices,
  getServiceById,
  createService,
  getProviderServices,
  deleteService,
  updateService,
  updateServiceStatus 
};