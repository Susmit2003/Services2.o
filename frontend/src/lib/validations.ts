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