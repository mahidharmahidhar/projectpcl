const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    // eslint-disable-next-line no-console
    console.error('MONGO_URI not set in .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
