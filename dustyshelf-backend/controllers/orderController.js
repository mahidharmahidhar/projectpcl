const { Order, OrderItem, User } = require('../models');

exports.addOrderItems = async (req, res, next) => {
    try {
        const {
            orderItems,
            shippingAddress,
            totalAmount,
            razorpayOrderId
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            res.status(400);
            throw new Error('No order items');
        }

        const order = await Order.create({
            userId: req.user.id,
            totalAmount,
            shippingAddress,
            razorpayOrderId
        });

        // Create order items
        const items = orderItems.map(item => ({
            ...item,
            orderId: order.id
        }));
        await OrderItem.bulkCreate(items);

        res.status(201).json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.user.id },
            include: [{ model: OrderItem, as: 'items' }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, orders });
    } catch (error) {
        next(error);
    }
};

exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                { model: OrderItem, as: 'items' },
                { model: User, attributes: ['name', 'email'] }
            ]
        });

        if (order) {
            if (order.userId !== req.user.id && req.user.role !== 'admin') {
                res.status(401);
                throw new Error('Not authorized to view this order');
            }
            res.json({ success: true, order });
        } else {
            res.status(404);
            throw new Error('Order not found');
        }
    } catch (error) {
        next(error);
    }
};
