const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Order } = require('../models');

exports.createRazorpayOrder = async (req, res, next) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: amount * 100,
            currency: currency,
            receipt: receipt || `receipt_${Date.now()}`,
        };

        const order = await instance.orders.create(options);
        res.json({ success: true, order });
    } catch (error) {
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
