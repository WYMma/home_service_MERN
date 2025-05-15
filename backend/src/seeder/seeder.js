const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const { users, categories, businesses, bookings } = require('./data');
const User = require('../models/User');
const Category = require('../models/Category');
const Business = require('../models/Business');
const Booking = require('../models/Booking');
const connectDB = require('../config/db');

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // Clear all existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Business.deleteMany();
    await Booking.deleteMany();

    // Import users
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;
    const businessUser = createdUsers[1]._id;
    const regularUser = createdUsers[2]._id;

    // Import categories
    const createdCategories = await Category.insertMany(categories);

    // Prepare businesses with proper references
    const businessesWithRefs = businesses.map((business, index) => {
      const category = createdCategories.find(cat => cat.name === business.category);
      return {
        ...business,
        owner: index === 0 ? businessUser : adminUser,
        category: category._id
      };
    });

    // Import businesses
    const createdBusinesses = await Business.insertMany(businessesWithRefs);

    // Prepare bookings with proper references
    const bookingsWithRefs = bookings.map((booking, index) => ({
      ...booking,
      user: regularUser,
      business: createdBusinesses[index]._id
    }));

    // Import bookings
    await Booking.insertMany(bookingsWithRefs);

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
    await Booking.deleteMany();

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
