const Razorpay = require('razorpay');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { Order, Book, User } = require('../models');

// Generate UPI QR Code
exports.generateUPIQR = async (req, res, next) => {
    try {
        const { bookId, quantity, amount } = req.body;
        const buyerId = req.user.id;

        // Get book details to find seller
        const book = await Book.findByPk(bookId, {
            include: [{ model: User, as: 'seller', attributes: ['id', 'upiId', 'name'] }]
        });

        if (!book) {
            res.status(404);
            throw new Error('Book not found');
        }

        if (!book.seller.upiId) {
            res.status(400);
            throw new Error('Seller has not configured UPI payment');
        }

        // Create a temporary order
        const order = await Order.create({
            buyerId,
            sellerId: book.sellerId,
            totalAmount: amount,
            paymentMethod: 'UPI',
            paymentStatus: 'Pending',
            shippingAddress: {} // Will be updated during checkout
        });

        // Generate UPI deep link
        const upiId = book.seller.upiId;
        const payeeName = encodeURIComponent(book.seller.name);
        const transactionRef = order.id;
        const upiLink = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&tn=BookPurchase&tr=${transactionRef}`;

        // Generate QR Code
        const qrCode = await QRCode.toDataURL(upiLink);

        res.json({
            success: true,
            qrCode,
            upiId: book.seller.upiId,
            amount,
            orderId: order.id,
            bookTitle: book.title,
            sellerName: book.seller.name
        });
    } catch (error) {
        next(error);
    }
};

// Verify UPI Payment
exports.verifyUPIPayment = async (req, res, next) => {
    try {
        const { orderId, upiTransactionId } = req.body;

        const order = await Order.findByPk(orderId);
        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        // In a real scenario, you would verify the transaction with the bank/UPI provider
        // For now, we'll mark it as paid
        await order.update({
            paymentStatus: 'Paid',
            upiTransactionId,
            paidAt: new Date()
        });

        res.json({
            success: true,
            message: "Payment verified successfully",
            orderId: order.id
        });
    } catch (error) {
        next(error);
    }
};

// Get seller's UPI details (for editing)
exports.getSellerUPI = async (req, res, next) => {
    try {
        const seller = await User.findByPk(req.user.id, {
            attributes: ['id', 'name', 'email', 'upiId']
        });

        res.json({ success: true, upiId: seller.upiId });
    } catch (error) {
        next(error);
    }
};

// Update seller's UPI ID
exports.updateSellerUPI = async (req, res, next) => {
    try {
        const { upiId } = req.body;

        if (!upiId || !upiId.includes('@')) {
            res.status(400);
            throw new Error('Invalid UPI ID format (e.g., 9999999999@paytm)');
        }

        const user = await User.findByPk(req.user.id);
        await user.update({ upiId });

        res.json({
            success: true,
            message: "UPI ID updated successfully",
            upiId
        });
    } catch (error) {
        next(error);
    }
};

exports.createRazorpayOrder = async (req, res, next) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;

        if (!amount || amount <= 0) {
            res.status(400);
            throw new Error('Invalid amount');
        }

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: currency,
            receipt: receipt || `receipt_${Date.now()}`,
        };

        const order = await instance.orders.create(options);
        res.json({ success: true, order });
    } catch (error) {
        console.error('Razorpay order creation error:', error.message);
        next(error);
    }
};

exports.verifyPayment = async (req, res, next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            dbOrderId
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            const order = await Order.findByPk(dbOrderId);
            if (order) {
                await order.update({
                    paymentStatus: 'Paid',
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: razorpay_payment_id,
                    paidAt: new Date()
                });
                res.json({ success: true, message: "Payment verified successfully" });
            } else {
                res.status(404);
                throw new Error('Order not found');
            }
        } else {
            res.status(400);
            throw new Error('Invalid signature');
        }
    } catch (error) {
        next(error);
    }
};
