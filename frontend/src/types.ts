// This file is the single source of truth for all your application's data shapes.
export interface UserProfile {
    _id: string;
    id: string;
    name: string;
    username: string;
    email: string;
    mobile: string;
    role: 'user' | 'admin';
    address: {
        line1: string;
        city: string;
        pinCode: string;
    };
    currency: 'INR' | 'USD';
    walletBalance: number;
    profileImage?: string;
    monthlyFreeBookings: number;
    dailyBookings: number;
    // --- THIS IS THE FIX ---
    // Add the fcmToken property to the user profile
    fcmToken?: string; 
}

export interface Service {
    _id: string;
    id: string;
    providerId: string;
    providerName: string;
    title: string;
    description: string;
    category: string;
    subCategory: string;
    price: number;
    priceDisplay: string;
    images: string[];
    zipCodes: string[];
    timeSlots: string[];
    status: 'Active' | 'Inactive' | 'Archived';
    ratingAvg: number;
    totalReviews: number;
}

export interface Booking {
    id: string;
    _id: string;
    serviceId: string;
    serviceTitle: string;
    providerId: string;
    providerName: string;
    bookedByUserName: string;
    bookingDate: string;
    timeSlot: string;
    status: 'pending' | 'confirmed' | 'rejected' | 'in-progress' | 'completed' | 'cancelled' | 'incompleted';
    totalPrice: number;
    currency: 'INR' | 'USD';
    address: {
        line1: string;
        city: string;
        pinCode: string;
    };
    userFeedback?: { stars: number; text: string };
    providerFeedback?: { stars: number; text: string };
    cancelledBy?: 'user' | 'provider';
    cancelledAt?: string;
}


export interface Notification {
    _id: string;
    id: string;
    user: string;
    title: string;
    message: string;
    isRead: boolean;
    type: 'booking' | 'review' | 'system';
    createdAt: string;
}






export interface Transaction {
    id: string;
    type: 'top_up' | 'booking_fee' | 'cancellation_fee_debit' | 'cancellation_fee_credit' | 'refund';
    amount: number;
    description: string;
    currency: 'INR' | 'USD';
    createdAt: string;
}

// Form Data Types
export interface ServiceFormData {
  title: string;
  description: string;
  category: string;
  subCategory: string;
  price: number;
  priceDisplay: string;
  images: string[];
  zipCodes: string[];
  timeSlots: string[];
}

export interface BookingFormData {
  serviceId: string;
  bookingDate: string;
  timeSlot: string;
  address: {
    line1: string;
    city: string;
    pinCode: string;
  };
  totalPrice: number;
  currency: 'INR' | 'USD';
}

// Auth Data Types
export interface LoginData {
    identifier: string;
    password?: string;
}

export interface SignupData {
    name: string;
    mobile: string;
    email: string;
    password?: string;
}