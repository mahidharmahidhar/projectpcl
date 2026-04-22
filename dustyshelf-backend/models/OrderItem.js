const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: DataTypes.STRING,
    price: DataTypes.DECIMAL(10, 2),
    quantity: DataTypes.INTEGER
});

module.exports = OrderItem;
