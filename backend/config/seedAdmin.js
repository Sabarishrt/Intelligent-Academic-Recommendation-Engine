const User = require('../models/User');

/**
 * Seed default admin user if it doesn't exist
 * This runs automatically when the server starts
 */
const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });

    if (!adminExists) {
      // Create admin user with plain password
      // The User model's pre-save hook will automatically hash it
      await User.create({
        name: 'System Administrator',
        email: 'admin@gmail.com',
        password: 'admin123', // Will be hashed by pre-save hook
        role: 'admin',
      });

      console.log('✅ Default admin user created successfully!');
      console.log('   Email: admin@gmail.com');
      console.log('   Password: admin123');
      console.log('   Role: admin');
    } else {
      console.log('ℹ️  Admin user already exists in database');
    }
  } catch (error) {
    // Handle duplicate key error gracefully (if admin was created between check and create)
    if (error.code === 11000) {
      console.log('ℹ️  Admin user already exists in database');
    } else {
      console.error('❌ Error seeding admin user:', error.message);
      // Don't throw error, just log it so server can still start
    }
  }
};

module.exports = seedAdmin;
