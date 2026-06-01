import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { Product } from '../models/Product.js';
import { seedProducts } from '../data/seedProducts.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    const deleted = await Product.deleteMany({});
    console.log(`Cleared ${deleted.deletedCount} existing products`);

    const inserted = await Product.insertMany(seedProducts);
    console.log(`Seeded ${inserted.length} products into MongoDB`);

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
