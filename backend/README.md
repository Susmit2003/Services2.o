# Our Services Backend API

A comprehensive backend API for the Our Services platform, built with Express.js and MongoDB.

## Features

- **Authentication**: JWT-based authentication with mobile number login
- **Password Recovery**: Forgot password functionality with temporary password generation
- **User Management**: Profile management, password changes, account deletion
- **Service Management**: CRUD operations for services with categories and filtering
- **Booking System**: Create and manage bookings with time slot validation
- **Review System**: Add, update, and manage reviews with rating calculations
- **Notifications**: Real-time notifications for users
- **Role-based Access**: Support for users, providers, and admins

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **CORS**: Enabled for frontend communication

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/our-services

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=30d

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login with mobile number and password
- `POST /api/auth/forgot-password` - Generate temporary password for mobile number

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile/:userId` - Update user profile
- `POST /api/users/change-password` - Change password
- `DELETE /api/users/account` - Delete account

### Services
- `GET /api/services` - Get all services (with filtering)
- `GET /api/services/:id` - Get service by ID
- `POST /api/services/create` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `GET /api/services/provider/my-services` - Get provider's services

### Bookings
- `POST /api/bookings/create` - Create booking
- `GET /api/bookings/user` - Get user's bookings
- `GET /api/bookings/provider` - Get provider's bookings
- `PUT /api/bookings/:bookingId/status` - Update booking status
- `GET /api/bookings/unavailable-slots` - Get unavailable time slots

### Reviews
- `POST /api/reviews/add` - Add review
- `GET /api/reviews/:serviceId` - Get reviews for service
- `GET /api/reviews/user/my-reviews` - Get user's reviews
- `PUT /api/reviews/:reviewId` - Update review
- `DELETE /api/reviews/:reviewId` - Delete review

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/mark-all-read` - Mark all as read
- `PUT /api/notifications/:notificationId/read` - Mark single as read
- `DELETE /api/notifications/:notificationId` - Delete notification
- `GET /api/notifications/unread-count` - Get unread count

## Data Models

### User
```javascript
{
  name: String,
  email: String (unique),
  mobile: String (unique),
  password: String (hashed),
  role: String (enum: ['user', 'provider', 'admin']),
  address: {
    line1: String,
    city: String,
    pinCode: String
  },
  currency: String,
  freeTransactionsUsed: Number,
  dailyBookings: Number,
  isActive: Boolean
}
```

### Service
```javascript
{
  provider: ObjectId (ref: User),
  title: String,
  description: String,
  category: String,
  subCategory: String,
  price: Number,
  priceDisplay: String,
  images: [String],
  zipCodes: [String],
  timeSlots: [String],
  status: String (enum: ['Active', 'Inactive', 'Archived']),
  ratingAvg: Number,
  totalReviews: Number
}
```

### Booking
```javascript
{
  user: ObjectId (ref: User),
  service: ObjectId (ref: Service),
  provider: ObjectId (ref: User),
  bookingDate: Date,
  timeSlot: String,
  status: String (enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rejected']),
  totalPrice: Number,
  address: {
    line1: String,
    city: String,
    pinCode: String
  },
  isFreeTransaction: Boolean
}
```

### Review
```javascript
{
  user: ObjectId (ref: User),
  service: ObjectId (ref: Service),
  rating: Number (1-5),
  comment: String
}
```

### Notification
```javascript
{
  user: ObjectId (ref: User),
  title: String,
  message: String,
  type: String (enum: ['booking', 'review', 'system']),
  isRead: Boolean,
  relatedBooking: ObjectId (ref: Booking),
  relatedService: ObjectId (ref: Service),
  relatedReview: ObjectId (ref: Review)
}
```

## Authentication Flow

1. **Login**: User provides mobile number and password
2. **Forgot Password**: User provides mobile number, receives temporary password
3. **Password Change**: User can change password after logging in with temporary password

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation
- Role-based access control
- Rate limiting ready (can be added)

## Development

### Project Structure
```
backend/
├── src/
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Custom middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── utils/          # Utility functions
├── server.js           # Main server file
├── package.json
└── README.md
```

### Adding New Features

1. Create model in `src/models/`
2. Create controller in `src/controllers/`
3. Create routes in `src/routes/`
4. Add route to `server.js`
5. Update documentation

## Testing

To test the API endpoints, you can use tools like:
- Postman
- Insomnia
- curl
- Thunder Client (VS Code extension)

## Deployment

1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set secure JWT secret
4. Configure CORS for production domain
5. Use PM2 or similar process manager

## Support

For issues and questions, please refer to the main project documentation or create an issue in the repository. 