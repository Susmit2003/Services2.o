import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  stars: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  text: {
    type: String,
    trim: true
  },
}, {
  _id: false
});

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'in-progress', 'completed', 'cancelled', 'incompleted'],
    default: 'pending'
  },
  totalPrice: {
    type: Number,
    required: true
  },
  address: {
    line1: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    pinCode: {
      type: String,
      required: true
    }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'fee_paid'],
    default: 'pending'
  },
  serviceVerificationCode: {
    type: String
  },
  userFeedback: feedbackSchema,
  providerFeedback: feedbackSchema,
  review: { // This field links to the review document
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  },
  cancelledBy: {
    type: String,
    enum: ['user', 'provider']
  },
  cancelledAt: {
    type: Date
  },
  incompletedAt: {
    type: Date
  },
  providerNotes: {
    type: String
  }
}, {
  timestamps: true
});

bookingSchema.index({
  user: 1,
  status: 1
});
bookingSchema.index({
  provider: 1,
  status: 1
});
bookingSchema.index({
  service: 1,
  bookingDate: 1,
  timeSlot: 1
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;