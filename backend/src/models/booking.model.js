import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingDate: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rejected'], 
    default: 'pending' 
  },
  totalPrice: { type: Number, required: true },
  address: {
    line1: { type: String, required: true },
    city: { type: String, required: true },
    pinCode: { type: String, required: true }
  },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  paymentMethod: { type: String },
  cancellationReason: { type: String },
  providerNotes: { type: String },
  customerNotes: { type: String },
  isFreeTransaction: { type: Boolean, default: false }
}, { timestamps: true });

// Add indexes for better query performance
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ provider: 1, status: 1 });
bookingSchema.index({ service: 1, status: 1 });
bookingSchema.index({ bookingDate: 1, status: 1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ provider: 1, createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;