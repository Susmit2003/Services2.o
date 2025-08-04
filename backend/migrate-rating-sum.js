import mongoose from 'mongoose';
import Review from './src/models/review.model.js';
import Service from './src/models/service.model.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/handyconnect';

async function migrateRatingSum() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all services
    const services = await Service.find({});
    console.log(`Found ${services.length} services to migrate`);

    for (const service of services) {
      // Get all reviews for this service
      const reviews = await Review.find({ service: service._id });
      
      // Calculate rating sum
      const ratingSum = reviews.reduce((sum, review) => sum + review.rating, 0);
      const totalReviews = reviews.length;
      const ratingAvg = totalReviews > 0 ? Math.round((ratingSum / totalReviews) * 10) / 10 : 0;

      // Update service with calculated values
      await Service.findByIdAndUpdate(service._id, {
        ratingSum,
        totalReviews,
        ratingAvg
      });

      console.log(`Updated service "${service.title}": ratingSum=${ratingSum}, totalReviews=${totalReviews}, ratingAvg=${ratingAvg}`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateRatingSum();
}

export default migrateRatingSum; 