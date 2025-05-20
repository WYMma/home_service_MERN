import bcrypt from 'bcryptjs';

const users = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    phone: '+1234567890',
    password: bcrypt.hashSync('123456', 10),
    role: 'admin',
    status: 'active'
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567891',
    password: bcrypt.hashSync('123456', 10),
    role: 'user',
    status: 'active'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    phone: '+1234567892',
    password: bcrypt.hashSync('123456', 10),
    role: 'user',
    status: 'active'
  }
];

const categories = [
  {
    name: 'Home Cleaning',
    description: 'Professional home cleaning services',
    icon: 'cleaning_services',
    bgcolor: '#FFE0B2',
    imageUrl: '/images/categories/cleaning.jpg'
  },
  {
    name: 'Plumbing',
    description: 'Expert plumbing services',
    icon: 'plumbing',
    bgcolor: '#E1BEE7',
    imageUrl: '/images/categories/plumbing.jpg'
  },
  {
    name: 'Electrical',
    description: 'Professional electrical services',
    icon: 'electrical_services',
    bgcolor: '#BBDEFB',
    imageUrl: '/images/categories/electrical.jpg'
  },
  {
    name: 'Gardening',
    description: 'Professional gardening and landscaping',
    icon: 'yard',
    bgcolor: '#C8E6C9',
    imageUrl: '/images/categories/gardening.jpg'
  },
  {
    name: 'Beauty & Wellness',
    description: 'Beauty and wellness services',
    icon: 'spa',
    bgcolor: '#FFCDD2',
    imageUrl: '/images/categories/beauty.jpg'
  }
];

const businesses = [
  {
    name: 'CleanPro Services',
    description: 'Professional cleaning services for your home',
    category: 0,
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
    rating: 4.5,
    reviewCount: 25,
    user: 1,
    status: 'active',
    isVerified: true
  },
  {
    name: 'Quick Fix Plumbing',
    description: 'Expert plumbing solutions',
    category: 1,
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
    rating: 4.8,
    reviewCount: 32,
    user: 2,
    status: 'active',
    isVerified: true
  }
];

const services = [
  {
    name: 'Basic House Cleaning',
    description: 'Basic cleaning of your home',
    duration: 120,
    price: 80,
    business: 0,
    category: 0
  },
  {
    name: 'Deep Cleaning',
    description: 'Thorough deep cleaning service',
    duration: 240,
    price: 160,
    business: 0,
    category: 0
  },
  {
    name: 'Basic Plumbing Service',
    description: 'Basic plumbing repairs',
    duration: 60,
    price: 100,
    business: 1,
    category: 1
  },
  {
    name: 'Emergency Service',
    description: '24/7 emergency plumbing service',
    duration: 120,
    price: 200,
    business: 1,
    category: 1
  }
];

const payments = [
  {
    user: 1,
    business: 0,
    amount: 299.99,
    status: 'completed',
    paymentMethod: 'credit_card',
    transactionId: 'TRX-001',
    subscriptionType: 'yearly',
    subscriptionStartDate: new Date('2024-01-01'),
    subscriptionEndDate: new Date('2024-12-31'),
    createdAt: new Date('2024-01-01')
  },
  {
    user: 2,
    business: 1,
    amount: 199.99,
    status: 'completed',
    paymentMethod: 'bank_transfer',
    transactionId: 'TRX-002',
    subscriptionType: 'monthly',
    subscriptionStartDate: new Date('2024-01-15'),
    subscriptionEndDate: new Date('2024-07-15'),
    createdAt: new Date('2024-01-15')
  },
  {
    user: 1,
    business: 0,
    amount: 299.99,
    status: 'pending',
    paymentMethod: 'credit_card',
    transactionId: 'TRX-003',
    subscriptionType: 'yearly',
    subscriptionStartDate: new Date('2024-03-01'),
    subscriptionEndDate: new Date('2024-12-31'),
    createdAt: new Date('2024-03-01')
  },
  {
    user: 2,
    business: 1,
    amount: 199.99,
    status: 'failed',
    paymentMethod: 'debit_card',
    transactionId: 'TRX-004',
    subscriptionType: 'monthly',
    subscriptionStartDate: new Date('2024-03-15'),
    subscriptionEndDate: new Date('2024-09-15'),
    createdAt: new Date('2024-03-15')
  }
];

const bookings = [
  {
    user: 1,
    business: 0,
    service: 0,
    date: new Date('2025-05-10'),
    startTime: '10:00',
    endTime: '12:00',
    status: 'pending',
    totalPrice: 80,
    notes: 'Please bring eco-friendly cleaning products'
  },
  {
    user: 2,
    business: 1,
    service: 2,
    date: new Date('2025-05-15'),
    startTime: '14:00',
    endTime: '15:00',
    status: 'confirmed',
    totalPrice: 100,
    notes: 'Leaking pipe in kitchen'
  }
];

export {
  users,
  categories,
  businesses,
  services,
  bookings,
  payments
};
