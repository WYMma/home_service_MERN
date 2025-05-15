# Home Service Booking Platform - Backend API

This is the backend API for the Home Service Booking Platform built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization
- Business management
- Category management
- Booking system
- File upload support
- Error handling
- Input validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory and add your environment variables:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- POST `/api/users/register` - Register a new user
- POST `/api/users/login` - Login user
- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update user profile

### Businesses
- GET `/api/businesses` - Get all businesses
- GET `/api/businesses/:id` - Get single business
- POST `/api/businesses` - Create a business
- PUT `/api/businesses/:id` - Update a business
- DELETE `/api/businesses/:id` - Delete a business
- GET `/api/businesses/:id/services` - Get business services

### Categories
- GET `/api/categories` - Get all categories
- GET `/api/categories/:id` - Get single category
- POST `/api/categories` - Create a category (Admin only)
- PUT `/api/categories/:id` - Update a category (Admin only)
- DELETE `/api/categories/:id` - Delete a category (Admin only)

### Bookings
- POST `/api/bookings` - Create a booking
- GET `/api/bookings/user` - Get user bookings
- GET `/api/bookings/business/:businessId` - Get business bookings
- PUT `/api/bookings/:id` - Update booking status
- GET `/api/bookings/slots/:businessId` - Get available slots

## Error Handling

The API uses a centralized error handling mechanism. All errors are formatted consistently and include:
- Status code
- Error message
- Stack trace (in development mode only)

## Security

- JWT authentication
- Password hashing
- Input validation
- CORS enabled
- Rate limiting
- Secure HTTP headers
