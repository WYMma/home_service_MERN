import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import { users, categories, businesses, services, bookings, payments } from './data.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Business from '../models/businessModel.js';
import Service from '../models/serviceModel.js';
import Booking from '../models/bookingModel.js';
import Payment from '../models/paymentModel.js';
import connectDB from '../config/db.js';

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Business.deleteMany();
    await Service.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();

    // Insert users and categories
    const createdUsers = await User.insertMany(users);
    const createdCategories = await Category.insertMany(categories);

    // Insert businesses (reference user and category)
    const businessesWithRefs = businesses.map(business => ({
      ...business,
      user: createdUsers[business.user]._id,
      category: createdCategories[business.category]._id,
    }));
    const createdBusinesses = await Business.insertMany(businessesWithRefs);

    // Insert services (reference business and category)
    const servicesWithRefs = services.map(service => ({
      ...service,
      business: createdBusinesses[service.business]._id,
      category: createdCategories[service.category]._id,
    }));
    const createdServices = await Service.insertMany(servicesWithRefs);

    // Insert bookings (reference user, business, and service)
    const bookingsWithRefs = bookings.map(booking => ({
      ...booking,
      user: createdUsers[booking.user]._id,
      business: createdBusinesses[booking.business]._id,
      service: createdServices[booking.service]._id,
    }));
    await Booking.insertMany(bookingsWithRefs);

    // Insert payments (reference user and business)
    const paymentsWithRefs = payments.map(payment => ({
      ...payment,
      user: createdUsers[payment.user]._id,
      business: createdBusinesses[payment.business]._id,
    }));
    await Payment.insertMany(paymentsWithRefs);

    console.log('Data Imported!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Category.deleteMany();
    await Business.deleteMany();
    await Service.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();

    console.log('Data Destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
