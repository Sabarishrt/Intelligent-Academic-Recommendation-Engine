const mongoose = require('mongoose');
const seedAdmin = require('./seedAdmin');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/academic-recommendation'
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed admin user after successful connection
    await seedAdmin();

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;