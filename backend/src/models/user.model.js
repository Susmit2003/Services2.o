import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const locationSchema = new mongoose.Schema({
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], required: true },
}, { _id: false });

const addressSchema = new mongoose.Schema({
  line1: { type: String },
  line2: { type: String },
  city: { type: String },
  pinCode: { type: String },
  country: { type: String },
}, { _id: false });

const userSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, trim: true },
  fullName: { type: String },
  password: { type: String, required: true, select: false }, // Hide password by default
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  profileImage: { type: String },
  address: addressSchema,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  location: { type: locationSchema, index: '2dsphere' },
  walletBalance: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  lastLoginAt: { type: Date, default: Date.now },
  monthlyFreeBookings: { type: Number, default: 10 },
  dailyBookings: { type: Number, default: 0 },
  fcmToken: { type: String },
}, {
  timestamps: true,
});

// Method to compare entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to automatically hash the password before saving a new user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;