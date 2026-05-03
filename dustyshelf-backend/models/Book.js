const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Book = sequelize.define('Book', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    condition: {
        type: DataTypes.ENUM('New', 'Good', 'Acceptable'),
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING,
        defaultValue: 'no-image.jpg'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    averageRating: {
        type: DataTypes.FLOAT,
        validate: {
            min: 1,
            max: 5
        }
    },
    sellerId: {
        type: DataTypes.UUID,
        allowNull: true,
        defaultValue: null
    }
});

module.exports = Book;
