// src/components/ProductDetails.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { BOOKS } from "../data/books";

export default function ProductDetails({ productId, onClose, onAddToCart }) {
  const book = BOOKS.find((b) => b.id === productId);
  const [qty, setQty] = useState(1);

  if (!book) return null;

  const handleAddToCart = () => {
    onAddToCart({ ...book, qty });
    setQty(1);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { delay: 0.1, duration: 0.3 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-end md:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="bg-gradient-to-br from-gray-900 to-gray-950 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8">
          {/* Close Button */}
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">{book.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Product Content */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            <motion.div variants={imageVariants}>
              <img
                src={book.image}
                alt={book.title}
                className="w-full h-auto rounded-xl shadow-2xl object-cover"
              />
            </motion.div>

            {/* Details */}
            <div className="space-y-6">
              {/* Author & Category */}
              <div>
                <p className="text-sm font-semibold text-indigo-400 mb-1">By {book.author}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-gray-300">
                    {book.category}
                  </span>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-gray-300">
                    {book.condition}
                  </span>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(book.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                        }`}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-400">
                  {book.rating} ({book.reviews.toLocaleString()} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <p className="text-4xl font-bold text-white">₹{book.price.toLocaleString()}</p>
              </div>

              {/* Description */}
              <div>
                <p className="text-gray-400 text-sm leading-relaxed">{book.longDescription}</p>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-300">Quantity:</label>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-2">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="px-3 py-1 text-gray-400 hover:text-white transition-colors"
                    >
                      −
                    </button>
                    <span className="px-4 font-semibold text-white">{qty}</span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="px-3 py-1 text-gray-400 hover:text-white transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20"
                >
                  Add to Cart
                </button>

                <button
                  onClick={onClose}
                  className="w-full border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-semibold py-3 rounded-xl transition-all duration-200"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
