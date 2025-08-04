import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['booking', 'review', 'system'], default: 'system' },
  isRead: { type: Boolean, default: false },
  relatedBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  relatedService: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  relatedReview: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification; 