// import mongoose from 'mongoose';

// const serviceSchema = new mongoose.Schema({
//   // --- FIX: The schema now correctly expects 'providerId' and 'providerName' ---
//   // This matches the data being sent by the controller and resolves the validation error.
//   providerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: [true, 'A provider ID is required.'],
//     ref: 'User',
//   },
//   providerName: {
//     type: String,
//     required: [true, 'A provider name is required.'],
//   },
  
//   title: { type: String, required: true },
//   description: { type: String, required: true },
//   category: { type: String, required: true },
//   subCategory: { type: String },
//   price: { type: Number, required: true },
//   priceDisplay: { type: String },
//   images: [{ type: String }],
//   zipCodes: [{ type: String }],
//   timeSlots: [{ type: String }],
//   status: { type: String, enum: ['Active', 'Inactive', 'Archived'], default: 'Active' },
//   availability: { type: String, default: 'Available' },
//   ratingAvg: { type: Number, default: 0 },
//   totalReviews: { type: Number, default: 0 },
//   totalBookings: { type: Number, default: 0 }, // Added for consistency
// }, { timestamps: true });


// const Service = mongoose.model('Service', serviceSchema);
// export default Service;






import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'A provider ID is required.'],
    ref: 'User',
  },
  providerName: {
    type: String,
    required: [true, 'A provider name is required.'],
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subCategory: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  priceDisplay: {
    type: String
  },
  images: [{
    type: String
  }],
  zipCodes: [{
    type: String
  }],
  timeSlots: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Archived'],
    default: 'Active'
  },
  ratingAvg: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  ratingSum: {
    type: Number,
    default: 0
  },
  totalBookings: {
    type: Number,
    default: 0
  },
}, {
  timestamps: true
});


const Service = mongoose.model('Service', serviceSchema);
export default Service;