import Service from '../models/service.model.js';
import User from '../models/user.model.js';

// Validation helper
const validateServiceInput = (data) => {
  const errors = [];
  
  if (!data.title || data.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }
  if (!data.description || data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }
  if (!data.category) {
    errors.push('Category is required');
  }
  if (!data.price || data.price <= 0) {
    errors.push('Price must be greater than 0');
  }
  if (data.price && data.price > 100000) {
    errors.push('Price cannot exceed ₹100,000');
  }
  
  return errors;
};

export const getAllServices = async (req, res) => {
  try {
    const { 
      category, 
      subcategory, 
      search, 
      pincode, 
      rating, 
      minPrice, 
      maxPrice,
      status = 'Active',
      page = 1,
      limit = 20
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter = { status };
    
    if (category) filter.category = category;
    if (subcategory) filter.subCategory = subcategory;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (pincode) filter.zipCodes = pincode;
    if (rating) filter.ratingAvg = { $gte: Number(rating) };

    // Build search query with sanitization
    let searchQuery = {};
    if (search && search.trim()) {
      const sanitizedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      searchQuery = {
        $or: [
          { title: { $regex: sanitizedSearch, $options: 'i' } },
          { description: { $regex: sanitizedSearch, $options: 'i' } },
          { category: { $regex: sanitizedSearch, $options: 'i' } }
        ]
      };
    }

    // Combine filters
    const finalFilter = { ...filter, ...searchQuery };

    // Get total count for pagination
    const totalServices = await Service.countDocuments(finalFilter);

    const services = await Service.find(finalFilter)
      .populate('provider', 'name email mobile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(); // Use lean() for better performance

    // Transform data to match frontend expectations
    const transformedServices = services.map(service => ({
      id: service._id,
      title: service.title,
      description: service.description,
      category: service.category,
      subCategory: service.subCategory,
      price: service.price,
      priceDisplay: service.priceDisplay || `₹${service.price}`,
      images: service.images,
      providerName: service.provider?.name || 'Unknown Provider',
      providerId: service.provider?._id,
      ratingAvg: service.ratingAvg,
      totalReviews: service.totalReviews,
      zipCodes: service.zipCodes,
      timeSlots: service.timeSlots,
      status: service.status,
      availability: service.availability,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    }));

    res.json({
      services: transformedServices,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalServices,
        pages: Math.ceil(totalServices / limitNum)
      }
    });
  } catch (error) {
    console.error('Get all services error:', error);
    res.status(500).json({ 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch services'
    });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name email mobile')
      .lean();

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Transform data to match frontend expectations
    const transformedService = {
      id: service._id,
      title: service.title,
      description: service.description,
      category: service.category,
      subCategory: service.subCategory,
      price: service.price,
      priceDisplay: service.priceDisplay || `₹${service.price}`,
      images: service.images,
      providerName: service.provider?.name || 'Unknown Provider',
      providerId: service.provider?._id,
      ratingAvg: service.ratingAvg,
      totalReviews: service.totalReviews,
      zipCodes: service.zipCodes,
      timeSlots: service.timeSlots,
      status: service.status,
      availability: service.availability,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    };

    res.json(transformedService);
  } catch (error) {
    console.error('Get service by ID error:', error);
    res.status(500).json({ 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch service details'
    });
  }
};

export const createService = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const {
      title,
      description,
      category,
      subCategory,
      price,
      images,
      zipCodes,
      timeSlots
    } = req.body;

    // Validate input
    const validationErrors = validateServiceInput({ title, description, category, price });
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Create service
    const service = new Service({
      provider: req.user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      subCategory,
      price: Number(price),
      priceDisplay: `₹${price}`,
      images: Array.isArray(images) ? images : [],
      zipCodes: Array.isArray(zipCodes) ? zipCodes : [],
      timeSlots: Array.isArray(timeSlots) ? timeSlots : []
    });

    const savedService = await service.save();
    
    // Populate provider data
    await savedService.populate('provider', 'name email mobile');

    // Transform response
    const transformedService = {
      id: savedService._id,
      title: savedService.title,
      description: savedService.description,
      category: savedService.category,
      subCategory: savedService.subCategory,
      price: savedService.price,
      priceDisplay: savedService.priceDisplay,
      images: savedService.images,
      providerName: savedService.provider?.name || 'Unknown Provider',
      providerId: savedService.provider?._id,
      ratingAvg: savedService.ratingAvg,
      totalReviews: savedService.totalReviews,
      zipCodes: savedService.zipCodes,
      timeSlots: savedService.timeSlots,
      status: savedService.status,
      availability: savedService.availability,
      createdAt: savedService.createdAt,
      updatedAt: savedService.updatedAt
    };

    res.status(201).json({
      message: 'Service created successfully',
      service: transformedService
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to create service'
    });
  }
};

export const updateService = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if user owns the service
    if (service.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }

    // Validate update data if provided
    if (req.body.title || req.body.description || req.body.price) {
      const validationErrors = validateServiceInput({
        title: req.body.title || service.title,
        description: req.body.description || service.description,
        category: req.body.category || service.category,
        price: req.body.price || service.price
      });
      if (validationErrors.length > 0) {
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: validationErrors
        });
      }
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('provider', 'name email mobile');

    // Transform response
    const transformedService = {
      id: updatedService._id,
      title: updatedService.title,
      description: updatedService.description,
      category: updatedService.category,
      subCategory: updatedService.subCategory,
      price: updatedService.price,
      priceDisplay: updatedService.priceDisplay,
      images: updatedService.images,
      providerName: updatedService.provider?.name || 'Unknown Provider',
      providerId: updatedService.provider?._id,
      ratingAvg: updatedService.ratingAvg,
      totalReviews: updatedService.totalReviews,
      zipCodes: updatedService.zipCodes,
      timeSlots: updatedService.timeSlots,
      status: updatedService.status,
      availability: updatedService.availability,
      createdAt: updatedService.createdAt,
      updatedAt: updatedService.updatedAt
    };

    res.json({
      message: 'Service updated successfully',
      service: transformedService
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to update service'
    });
  }
};

export const deleteService = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if user owns the service
    if (service.provider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this service' });
    }

    // Soft delete - change status to Archived
    service.status = 'Archived';
    await service.save();

    res.json({ message: 'Service archived successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to delete service'
    });
  }
};

export const getProviderServices = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const services = await Service.find({ provider: req.user.id })
      .populate('provider', 'name email mobile')
      .sort({ createdAt: -1 })
      .lean();

    // Transform data to match frontend expectations
    const transformedServices = services.map(service => ({
      id: service._id,
      title: service.title,
      description: service.description,
      category: service.category,
      subCategory: service.subCategory,
      price: service.price,
      priceDisplay: service.priceDisplay || `₹${service.price}`,
      images: service.images,
      providerName: service.provider?.name || 'Unknown Provider',
      providerId: service.provider?._id,
      ratingAvg: service.ratingAvg,
      totalReviews: service.totalReviews,
      zipCodes: service.zipCodes,
      timeSlots: service.timeSlots,
      status: service.status,
      availability: service.availability,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt
    }));

    res.json(transformedServices);
  } catch (error) {
    console.error('Get provider services error:', error);
    res.status(500).json({ 
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch provider services'
    });
  }
};