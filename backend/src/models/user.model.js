// backend/src/models/user.model.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // <-- THIS LINE WAS MISSING

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
  // 'this.password' refers to the hashed password of the user instance
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to automatically hash the password before saving a new user
userSchema.pre('save', async function (next) {
  // Only run this function if the password was modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;