import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, sparse: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'provider', 'admin'], default: 'user' },
  address: {
    line1: { type: String },
    city: { type: String },
    pinCode: { type: String }
  },
  currency: { type: String, default: 'INR' },
  freeTransactionsUsed: { type: Number, default: 0 },
  dailyBookings: { type: Number, default: 0 },
  lastBookingDate: { type: Date },
  profileImage: { type: String },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Add indexes for better query performance (removed duplicate mobile and email indexes)
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ isActive: 1 });

const User = mongoose.model('User', userSchema);
export default User;