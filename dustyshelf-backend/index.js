const express = require('express');
const path = require('path');
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

// ── Serve static frontend files from ../dustyshelf ──────────────────────────
const frontendPath = path.join(__dirname, '..', 'dustyshelf');
app.use(express.static(frontendPath));

// Mount API routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// Error handler (for API errors)
app.use('/api', errorHandler);

// ── Catch-all: serve index.html for any non-API route ───────────────────────
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
