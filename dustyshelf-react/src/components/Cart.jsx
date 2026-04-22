// src/components/Cart.jsx
import { motion, AnimatePresence } from "framer-motion";

export default function Cart({ isOpen, items, onClose, onCheckout }) {
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  const removeItem = (id) => {
    // Will be handled by parent component
  };

  const containerVariants = {
    hidden: { opacity: 0, x: 400 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
    exit: { opacity: 0, x: 400, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-0 h-screen w-full md:w-96 bg-gradient-to-b from-gray-900 to-gray-950 border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <h2 className="text-2xl font-bold text-white">Shopping Cart</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
                  <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9m-3-9h-3m-4-3a2 2 0 110 4 2 2 0 010-4z"
                    />
                  </svg>
                  <p className="text-gray-400 text-center text-sm">Your cart is empty</p>
                  <button
                    onClick={onClose}
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-3 p-6">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex gap-4 bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                        <p className="text-xs text-gray-400 mb-2">{item.author}</p>
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-white">₹{(item.price * item.qty).toLocaleString()}</p>
                          <span className="text-xs bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 px-2 py-1 rounded">
                            x{item.qty}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/5 p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Shipping</span>
                    <span className="text-emerald-400">Free</span>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex justify-between text-lg font-bold text-white">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={onCheckout}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={onClose}
                  className="w-full border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 font-semibold py-3 rounded-xl transition-all duration-200"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
