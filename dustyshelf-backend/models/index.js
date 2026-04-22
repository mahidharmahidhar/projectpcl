const User = require('./User');
const Book = require('./Book');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// User & Book (Seller relationship)
User.hasMany(Book, { foreignKey: 'sellerId', as: 'soldBooks' });
Book.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

// Cart relationship
User.hasMany(CartItem, { foreignKey: 'userId', as: 'cartItems' });
CartItem.belongsTo(User, { foreignKey: 'userId' });
Book.hasMany(CartItem, { foreignKey: 'bookId' });
CartItem.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

// Order relationship
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Book.hasMany(OrderItem, { foreignKey: 'bookId' });
OrderItem.belongsTo(Book, { foreignKey: 'bookId' });

module.exports = {
    User,
    Book,
    CartItem,
    Order,
    OrderItem
};
