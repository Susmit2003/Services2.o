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

export interface UserProfile {
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
  freeTransactionsUsed?: number;
  dailyBookings?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  service: Service;
  userId: string;
  providerId: string;
  bookingDate: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalPrice: number;
  address: {
    line1: string;
    city: string;
    pinCode: string;
  };
  createdAt: string;
  updatedAt: string;
}

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
  type: 'booking' | 'review' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface LoginData {
  mobile: string;
  password: string;
}

export interface SignupData {
  name: string;
  mobile: string;
  password: string;
  email?: string;
}

export interface ServiceFormData {
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  price: number;
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
}

export interface ReviewFormData {
  serviceId: string;
  rating: number;
  comment: string;
} 