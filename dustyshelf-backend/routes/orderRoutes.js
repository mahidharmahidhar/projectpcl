const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getMyOrders,
    getOrderById
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', addOrderItems);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);

module.exports = router;
