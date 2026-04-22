const express = require('express');
const router = express.Router();
const {
    getBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
} = require('../controllers/bookController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', protect, admin, createBook);
router.put('/:id', protect, admin, updateBook);
router.delete('/:id', protect, admin, deleteBook);

module.exports = router;
