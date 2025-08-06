import { z } from 'zod';

// Login
export const loginSchema = z.object({
  mobile: z.string().min(10, { message: 'Mobile number must be at least 10 digits.' }),
  password: z.string().min(1, { message: 'Password cannot be empty.' }),
});

// Signup
export const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  mobile: z.string().min(10, { message: 'Mobile number must be at least 10 digits.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
  email: z.string().email({ message: 'A valid email is required.' }).optional(),
});

// You can add more validation schemas for other forms here
// For example, a schema for creating a service:
export const serviceSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  description: z.string().min(20, { message: 'Description must be at least 20 characters.' }),
  price: z.number().positive({ message: 'Price must be a positive number.' }),
});
export const updateUserProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long.'),
  fullName: z.string().min(3, 'Full name must be at least 3 characters long.'),
  email: z.string().email('Please enter a valid email address.'),
  mobile: z.string().regex(/^\d{10,15}$/, 'Please enter a valid mobile number.'),
  
  // Address is an optional object
  address: z.object({
    line1: z.string().optional(),
    city: z.string().optional(),
    pinCode: z.string().optional(),
  }).optional(),
  
  // Profile image is handled separately, so it's optional here.
  profileImage: z.string().url('Invalid URL').optional().nullable(),
});

// This creates a TypeScript type from the Zod schema
export type UpdateUserProfileParams = z.infer<typeof updateUserProfileSchema>;