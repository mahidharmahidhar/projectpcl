const { CartItem, Book } = require('../models');

exports.getCart = async (req, res, next) => {
    try {
        const cartItems = await CartItem.findAll({
            where: { userId: req.user.id },
            include: [{ model: Book, as: 'book' }]
        });
        res.json({ success: true, cart: { items: cartItems } });
    } catch (error) {
        next(error);
    }
};

exports.addToCart = async (req, res, next) => {
    try {
        const { bookId, quantity } = req.body;
        
        let cartItem = await CartItem.findOne({
            where: { userId: req.user.id, bookId }
        });

        if (cartItem) {
            cartItem.quantity += (quantity || 1);
            await cartItem.save();
        } else {
            cartItem = await CartItem.create({
                userId: req.user.id,
                bookId,
                quantity: quantity || 1
            });
        }

        res.json({ success: true, cartItem });
    } catch (error) {
        next(error);
    }
};

exports.removeFromCart = async (req, res, next) => {
    try {
        await CartItem.destroy({
            where: { userId: req.user.id, bookId: req.params.bookId }
        });
        res.json({ success: true, message: 'Item removed' });
    } catch (error) {
        next(error);
    }
};

exports.updateQuantity = async (req, res, next) => {
    try {
        const { bookId, quantity } = req.body;
        const cartItem = await CartItem.findOne({
            where: { userId: req.user.id, bookId }
        });

        if (cartItem) {
            cartItem.quantity = quantity;
            await cartItem.save();
            res.json({ success: true, cartItem });
        } else {
            res.status(404);
            throw new Error('Item not found in cart');
        }
    } catch (error) {
        next(error);
    }
};
