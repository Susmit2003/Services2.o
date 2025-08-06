// backend/src/models/user.model.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    index: '2dsphere', // <-- This creates the geospatial index
  },
});

const addressSchema = mongoose.Schema({
    line1: { type: String, trim: true },
    city: { type: String, trim: true },
    pinCode: { type: String, trim: true },
});

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'provider', 'admin'],
      default: 'user',
    },
    // --- FIX: START ---
    // Ensure that every new user is active by default at the database level.
    isActive: {
        type: Boolean,
        default: true,
    },
     location: locationSchema, 
    // --- FIX: END ---
    address: addressSchema,
    currency: {
        type: String,
        default: 'INR'
    },
    walletBalance: {
        type: Number,
        default: 0
    },
    profileImage: {
        type: String,
        default: ''
    }
  },
  {
    timestamps: true,
  }
);

// Method to compare entered password with the hashed password in the database
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