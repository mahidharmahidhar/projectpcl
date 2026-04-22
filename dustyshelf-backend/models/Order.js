const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    paymentStatus: {
        type: DataTypes.ENUM('Pending', 'Paid', 'Failed'),
        defaultValue: 'Pending'
    },
    razorpayOrderId: {
        type: DataTypes.STRING
    },
    razorpayPaymentId: {
        type: DataTypes.STRING
    },
    shippingAddress: {
        type: DataTypes.JSON, // SQLite supports JSON via string but Sequelize handles it
        allowNull: false
    },
    paidAt: {
        type: DataTypes.DATE
    }
});

module.exports = Order;
