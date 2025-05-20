# Home Service MERN Application

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) application for managing home services, including business listings, bookings, and user management.

## Project Structure

```
├── frontend/          # React frontend application
│   ├── public/       # Static files
│   └── src/          # Source code
│       ├── components/   # Reusable components
│       ├── pages/       # Page components
│       ├── services/    # API services
│       └── store/       # State management
│
└── backend/          # Node.js backend application
    ├── controllers/  # Route controllers
    ├── models/      # Database models
    ├── routes/      # API routes
    └── uploads/     # File uploads directory
```

## Features

- User authentication and authorization
- Business profile management
- Service booking system
- Category-based service browsing
- Admin dashboard
- File upload functionality
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/WYMma/home_service_MERN.git
cd home_service_MERN
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
