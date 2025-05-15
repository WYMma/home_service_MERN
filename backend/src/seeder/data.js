const bcrypt = require('bcryptjs');

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'admin'
  },
  {
    name: 'John Business',
    email: 'john@business.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'business'
  },
  {
    name: 'Jane Customer',
    email: 'jane@example.com',
    password: bcrypt.hashSync('123456', 10),
    role: 'user'
  }
];

const categories = [
  {
    name: 'Home Cleaning',
    description: 'Professional home cleaning services',
    icon: 'cleaning_services'
  },
  {
    name: 'Plumbing',
    description: 'Expert plumbing services',
    icon: 'plumbing'
  },
  {
    name: 'Electrical',
    description: 'Professional electrical services',
    icon: 'electrical_services'
  },
  {
    name: 'Gardening',
    description: 'Professional gardening and landscaping',
    icon: 'yard'
  },
  {
    name: 'Beauty & Wellness',
    description: 'Beauty and wellness services',
    icon: 'spa'
  }
];

const businesses = [
  {
    name: 'CleanPro Services',
    description: 'Professional cleaning services for your home',
    category: 'Home Cleaning',
    address: {
      street: '123 Clean Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    contactPerson: 'John Business',
    phone: '+1234567890',
    email: 'contact@cleanpro.com',
    workingHours: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { open: '09:00', close: '18:00' },
      saturday: { open: '10:00', close: '15:00' },
      sunday: { open: '', close: '' }
    },
    services: [
      {
        name: 'Basic House Cleaning',
        description: 'Basic cleaning of your home',
        duration: 120,
        price: 80
      },
      {
        name: 'Deep Cleaning',
        description: 'Thorough deep cleaning service',
        duration: 240,
        price: 160
      }
    ],
    rating: 4.5,
    reviewCount: 25
  },
  {
    name: 'Quick Fix Plumbing',
    description: 'Expert plumbing solutions',
    category: 'Plumbing',
    address: {
      street: '456 Plumber Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA'
    },
    contactPerson: 'Mike Plumber',
    phone: '+1234567891',
    email: 'service@quickfix.com',
    workingHours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '09:00', close: '14:00' },
      sunday: { open: '', close: '' }
    },
    services: [
      {
        name: 'Basic Plumbing Service',
        description: 'Basic plumbing repairs',
        duration: 60,
        price: 100
      },
      {
        name: 'Emergency Service',
        description: '24/7 emergency plumbing service',
        duration: 120,
        price: 200
      }
    ],
    rating: 4.8,
    reviewCount: 32
  }
];

const bookings = [
  {
    date: new Date('2025-05-10'),
    time: '10:00',
    status: 'pending',
    notes: 'Please bring eco-friendly cleaning products',
    service: {
      name: 'Basic House Cleaning',
      price: 80,
      duration: 120
    }
  },
  {
    date: new Date('2025-05-15'),
    time: '14:00',
    status: 'confirmed',
    notes: 'Leaking pipe in kitchen',
    service: {
      name: 'Basic Plumbing Service',
      price: 100,
      duration: 60
    }
  }
];

module.exports = {
  users,
  categories,
  businesses,
  bookings
};
