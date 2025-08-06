// frontend/src/types.ts
import type { LucideIcon } from 'lucide-react';

// --- Authentication & User ---

export interface LoginData {
  identifier: string; // Can be email or mobile
  password: string;
}

export interface SignupData {
  name: string;
  mobile: string;
  email: string;
  password: string;
}

export interface UserProfile {
  _id: string;
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: 'user' | 'provider' | 'admin';
  isActive: boolean;
  profileImage?: string | null;
  address?: {
    line1?: string;
    city?: string;
    pinCode?: string;
  };
  currency: string;
  walletBalance?: number;
  createdAt: string;
  updatedAt: string;
  username?: string;
  fullName?: string;
  mobileNumber?: string;
}


// --- Service & Booking ---

export interface ServiceCategory {
    name: string;
    query: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    subcategories: {
        name: string;
        query: string;
        icon?: LucideIcon;
        color?: string;
    }[];
}

export interface ServiceFormData {
  title: string;
  description: string;
  category: string;
  subCategory?: string;
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
  currency: string;
}

export interface Service {
  _id: string;
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
  totalBookings?: number; // <-- FIX: Added the missing property
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
  service?: Service;
  serviceTitle?: string;
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

export interface Transaction {
    id: string;
    type: 'top_up' | 'booking_fee' | 'cancellation_fee' | 'refund';
    amount: number;
    description: string;
    currency: string;
    createdAt: string;
}