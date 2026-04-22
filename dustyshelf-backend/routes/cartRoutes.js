const express = require('express');
const router = express.Router();
const {
    getCart,
    addToCart,
    removeFromCart,
    updateQuantity
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All cart routes are protected

router.get('/', getCart);
router.post('/add', addToCart);
router.delete('/remove/:bookId', removeFromCart);
router.put('/update', updateQuantity);

module.exports = router;
