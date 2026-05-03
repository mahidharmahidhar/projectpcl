const express = require('express');
const router = express.Router();
const {
    createRazorpayOrder,
    verifyPayment,
    generateUPIQR,
    verifyUPIPayment,
    getSellerUPI,
    updateSellerUPI
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// ── Public payment routes (Firebase auth on frontend) ─────────────
// These don't require JWT since the frontend uses Firebase Auth.
// The order amount is verified server-side via Razorpay signatures.
router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);

// ── Protected routes (require backend JWT) ────────────────────────
router.post('/generate-upi-qr', protect, generateUPIQR);
router.post('/verify-upi', protect, verifyUPIPayment);
router.get('/seller-upi', protect, getSellerUPI);
router.post('/update-seller-upi', protect, updateSellerUPI);

module.exports = router;
