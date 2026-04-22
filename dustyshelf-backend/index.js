const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { initializeFirebase } = require('./config/firebase');
const errorHandler = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize Firebase Admin
initializeFirebase();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'DustyShelf API is running...' });
});

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
