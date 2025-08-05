// frontend/src/types.ts

// --- Authentication & User ---

export interface LoginData {
  identifier: string;
  password: string;
}

export interface SignupData {
  name: string;
  mobile: string;
  email: string;
  password: string;
}

export interface UserProfile {
  _id: string; // Use _id for MongoDB consistency
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: 'user' | 'provider' | 'admin';
  profileImage?: string;
  address?: {
    line1: string;
    city: string;
    pinCode: string;
  };
  currency: string;
  walletBalance?: number;
  createdAt: string;
  updatedAt: string;
}


// --- Service & Booking ---

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  price: number;
  priceDisplay?: string;
  images: string[];
  providerName: string;
  providerId: string;
  ratingAvg?: number;
  totalReviews?: number;
  zipCodes: string[];
  timeSlots: string[];
  status: 'Active' | 'Inactive' | 'Archived';
  availability: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  service?: Service; // Service object might not always be populated
  serviceTitle?: string; // Fallback title
  userId: string;
  providerId: string;
  providerName: string;
  bookingDate: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'rejected';
  totalPrice: number;
  address: {
    line1: string;
    city: string;
    pinCode: string;
  };
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'fee_paid';
  serviceVerificationCode?: string;
  userFeedback?: {
    stars: number;
    text: string;
  };
  providerFeedback?: {
    stars: number;
    text: string;
  };
  cancelledBy?: 'user' | 'provider';
  cancelledAt?: string;
  incompletedAt?: string;
  requestedAt: string;
  bookerFeePaid: number;
  createdAt: string;
  updatedAt: string;
}


// --- Other ---

export interface Review {
  id: string;
  serviceId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'review' | 'system' | 'wallet';
  isRead: boolean;
  createdAt: string;
  link?: string;
}