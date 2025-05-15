import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Business from '../models/businessModel.js';

dotenv.config();

/**
 * This script updates all businesses in the database to use a single category field
 * instead of a categories array field.
 * 
 * Usage:
 * node migrateBusinessCategories.js
 */

const migrateBusinessCategories = async () => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all businesses with categories array
    const businesses = await Business.find({
      categories: { $exists: true, $ne: [] }
    });

    console.log(`Found ${businesses.length} businesses with categories array`);

    // Update each business
    for (const business of businesses) {
      // Take the first category from the array if it exists
      const firstCategory = business.categories && business.categories.length > 0 
        ? business.categories[0] 
        : null;

      // Update the business with the new category field
      if (firstCategory) {
        console.log(`Business: ${business.name}, Converting from categories array to single category`);
        console.log(`  - Original categories: ${JSON.stringify(business.categories)}`);
        console.log(`  - New category: ${firstCategory}`);
        
        business.category = firstCategory;
        await business.save();
        console.log(`Updated business ID: ${business._id}, name: ${business.name}`);
      }
    }

    console.log('Migration completed successfully');
    
    // Disconnect from the database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateBusinessCategories(); 