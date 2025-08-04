import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
  availability: { type: String, default: 'Available' },
  ratingAvg: { type: Number, default: 0 },
  ratingSum: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  tags: [{ type: String }]
}, { timestamps: true });

// Virtual for provider name
serviceSchema.virtual('providerName', {
  ref: 'User',
  localField: 'provider',
  foreignField: '_id',
  justOne: true,
  get: function() {
    return this.populated('provider') ? this.provider.name : null;
  }
});

// Ensure virtuals are serialized
serviceSchema.set('toJSON', { virtuals: true });
serviceSchema.set('toObject', { virtuals: true });

// Add indexes for better query performance
serviceSchema.index({ status: 1, category: 1, subCategory: 1 });
serviceSchema.index({ status: 1, provider: 1 });
serviceSchema.index({ status: 1, ratingAvg: -1 });
serviceSchema.index({ status: 1, price: 1 });
serviceSchema.index({ status: 1, zipCodes: 1 });
serviceSchema.index({ status: 1, createdAt: -1 });
serviceSchema.index({ title: 'text', description: 'text', category: 'text' });
serviceSchema.index({ isFeatured: 1, status: 1 });

const Service = mongoose.model('Service', serviceSchema);
export default Service;