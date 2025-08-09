import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  providerName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String },
  price: { type: Number, required: true },
  priceDisplay: { type: String },
  images: [{ type: String }],
  zipCodes: [{ type: String }],
  timeSlots: [{ type: String }],
  status: { type: String, enum: ['Active', 'Inactive', 'Archived'], default: 'Active' },
  
  // --- FIX: Add fields for accurate rating calculation ---
  ratingAvg: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  ratingSum: { type: Number, default: 0 }, // This is crucial for accurate averages
  
  totalBookings: { type: Number, default: 0 },
}, {
  timestamps: true
});

const Service = mongoose.model('Service', serviceSchema);
export default Service;