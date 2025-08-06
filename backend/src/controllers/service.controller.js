import asyncHandler from 'express-async-handler';
import Service from '../models/service.model.js';
import User from '../models/user.model.js';
import { serviceHierarchy } from '../lib/constants.js';

// This is a placeholder for a real geocoding service.
// In a production app, you would use a service like the Google Maps Geocoding API
// to convert a PIN code string into latitude and longitude coordinates.
const getCoordsForPincode = async (pincode) => {
  console.log(`Geocoding PIN: ${pincode} (using placeholder data)`);
  // This is a simplified lookup. A real implementation would involve an API call.
  const pincodeLocationMap = {
    "110001": { longitude: 77.216721, latitude: 28.644800 }, // Delhi
    "400001": { longitude: 72.8357, latitude: 18.9401 },    // Mumbai
    "700001": { longitude: 88.363892, latitude: 22.572645 }, // Kolkata
    // Add more known pincodes here for testing
  };
  return pincodeLocationMap[pincode] || null;
};

/**
 * @desc    Get all services with advanced filtering, including geospatial search
 * @route   GET /api/services
 * @access  Public
 */
const getAllServices = asyncHandler(async (req, res) => {
  const { category, subcategory, search, pincode, rating } = req.query;
  const query = {};

  // If no filters are provided at all, it's the initial page load.
  // Send back the category list so the user can start Browse.
  if (!category && !subcategory && !search && !pincode && !rating) {
    console.log("No filters applied. Returning main category list.");
    return res.json({
      services: [], // No services are needed yet
      categories: serviceHierarchy,
    });
  }

  // Build the basic query from filters
  if (category) query.category = category;
  if (subcategory) query.subCategory = subcategory;
  if (rating) query.ratingAvg = { $gte: Number(rating) };
  if (search) {
      // Search in title, description, and provider's name
      query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { providerName: { $regex: search, $options: 'i' } }
      ];
  }

  // --- Advanced PIN Code Filtering Logic ---
  if (pincode) {
    // Step 1: Attempt to find services with an exact match on the service's own zipCodes array.
    const servicesByExactZip = await Service.find({ ...query, zipCodes: pincode });

    // Step 2: If no exact matches are found, perform a geospatial radius search.
    if (servicesByExactZip.length === 0) {
      console.log(`No exact ZIP match for ${pincode}. Attempting radius search.`);
      const coords = await getCoordsForPincode(pincode);
      if (coords) {
        // Find provider IDs who are located within a 10km radius
        const providersInRadius = await User.find({
          role: 'provider',
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: [coords.longitude, coords.latitude] },
              $maxDistance: 10000, // 10,000 meters = 10km
            },
          },
        }).select('_id');

        const providerIds = providersInRadius.map(p => p._id);
        
        // Add this condition to the main query.
        // This will find all services offered by any of the providers found in the radius.
        if (providerIds.length > 0) {
            query.providerId = { $in: providerIds };
        } else {
            // If no providers are in the radius, ensure no results are returned
            return res.json({ services: [], categories: serviceHierarchy });
        }

      } else {
        // If the pincode is not geocodable and there's no exact match, return no results
        console.log(`PIN code ${pincode} could not be geocoded.`);
        return res.json({ services: [], categories: serviceHierarchy });
      }
    } else {
        // If we found services by exact zip match, use that as the result
        console.log(`Found ${servicesByExactZip.length} services with exact ZIP match.`);
        return res.json({ services: servicesByExactZip, categories: serviceHierarchy });
    }
  }

  const finalServices = await Service.find(query).limit(50); // Add a limit to prevent huge responses

  res.json({
    services: finalServices,
    categories: serviceHierarchy, // Always return the category list for the filter dropdowns
  });
});

/**
 * @desc    Get a single service by ID
 * @route   GET /api/services/:id
 * @access  Public
 */
const getServiceById = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (service) {
        res.json(service);
    } else {
        res.status(404);
        throw new Error('Service not found');
    }
});

/**
 * @desc    Create a new service
 * @route   POST /api/services/create
 * @access  Private (Provider)
 */


/**
 * @desc    Update the status of a service (e.g., Active/Inactive)
 * @route   PATCH /api/services/:id/status
 * @access  Private (Provider)
 */



/**
 * @desc    Get services for the currently logged-in provider
 * @route   GET /api/services/provider
 * @access  Private (Provider)
 */
const getProviderServices = asyncHandler(async (req, res) => {
    const services = await Service.find({ providerId: req.user._id });
    console.log("My Services for Provider:", services);
    
    res.json(services);
});

const deleteService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    // Check if the service exists
    if (!service) {
        res.status(404);
        throw new Error('Service not found');
    }

    // Check if the logged-in user is the owner of the service
    if (service.providerId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized to delete this service');
    }

    // In a real app, you might "soft delete" by changing a status,
    // but for now, we will perform a hard delete.
    await service.deleteOne();
    
    res.status(200).json({ message: 'Service removed successfully' });
});

const updateService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    if (!service) {
        res.status(404);
        throw new Error('Service not found');
    }

    // Check if the logged-in user is the owner of the service
    if (service.providerId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized to update this service');
    }

    // Update fields from the request body
    service.title = req.body.title || service.title;
    service.description = req.body.description || service.description;
    service.category = req.body.category || service.category;
    service.subCategory = req.body.subCategory || service.subCategory;
    service.price = req.body.price || service.price;
    service.priceDisplay = req.body.priceDisplay || service.priceDisplay;
    service.images = req.body.images || service.images;
    service.zipCodes = req.body.zipCodes || service.zipCodes;
    service.timeSlots = req.body.timeSlots || service.timeSlots;
    service.status = req.body.status || service.status;

    const updatedService = await service.save();
    res.json(updatedService);
});



const createService = asyncHandler(async (req, res) => {
    const { title, description, category, subCategory, price, priceDisplay, images, zipCodes, timeSlots } = req.body;
    
    // The user object is attached to the request by the 'protect' middleware
    const provider = req.user;

    if (!provider) {
        res.status(401);
        throw new Error('Not authorized. No user found.');
    }

    const service = new Service({
        providerId: provider._id, // --- FIX: Use the authenticated user's ID
        providerName: provider.name, // --- FIX: Use the authenticated user's name
        title, description, category, subCategory, price, priceDisplay, images, zipCodes, timeSlots
    });

    const createdService = await service.save();
    res.status(201).json(createdService);
});



/**
 * @desc    Update the status of a service (e.g., Active/Inactive)
 * @route   PATCH /api/services/:id/status
 * @access  Private (Provider)
 */
const updateServiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    if (service.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }
    if (!['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    service.status = status;
    await service.save();
    res.json({ message: 'Service status updated successfully', service });

  } catch (error) {
    console.error('Update service status error:', error);
    res.status(500).json({ message: 'Failed to update service status' });
  }
};




export {
  getAllServices,
  getServiceById,
  createService,
  getProviderServices,
  deleteService,
  updateService,
  updateServiceStatus 
};