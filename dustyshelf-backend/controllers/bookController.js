const { Book, User } = require('../models');
const { Op } = require('sequelize');

exports.getBooks = async (req, res, next) => {
    try {
        const pageSize = 8;
        const page = Number(req.query.pageNumber) || 1;

        const where = {};
        if (req.query.keyword) {
            where.title = { [Op.like]: `%${req.query.keyword}%` };
        }
        if (req.query.condition) {
            where.condition = req.query.condition;
        }
        if (req.query.category) {
            where.category = req.query.category;
        }

        const { count, rows: books } = await Book.findAndCountAll({
            where,
            limit: pageSize,
            offset: pageSize * (page - 1),
            order: [['createdAt', 'DESC']],
            include: [{ model: User, as: 'seller', attributes: ['name', 'email'] }]
        });

        res.json({
            success: true,
            books,
            page,
            pages: Math.ceil(count / pageSize)
        });
    } catch (error) {
        next(error);
    }
};

exports.getBookById = async (req, res, next) => {
    try {
        const book = await Book.findByPk(req.params.id, {
            include: [{ model: User, as: 'seller', attributes: ['name', 'email'] }]
        });

        if (book) {
            res.json({ success: true, book });
        } else {
            res.status(404);
            throw new Error('Book not found');
        }
    } catch (error) {
        next(error);
    }
};

exports.createBook = async (req, res, next) => {
    try {
        const book = await Book.create({
            ...req.body,
            sellerId: req.user.id
        });
        res.status(201).json({ success: true, book });
    } catch (error) {
        next(error);
    }
};

exports.updateBook = async (req, res, next) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (book) {
            await book.update(req.body);
            res.json({ success: true, book });
        } else {
            res.status(404);
            throw new Error('Book not found');
        }
    } catch (error) {
        next(error);
    }
};

exports.deleteBook = async (req, res, next) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (book) {
            await book.destroy();
            res.json({ success: true, message: 'Book removed' });
        } else {
            res.status(404);
            throw new Error('Book not found');
        }
    } catch (error) {
        next(error);
    }
};
