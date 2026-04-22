// src/App.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Shop from "./components/Shop";
import ReviewsSection from "./components/ReviewsSection";
import NewsletterSignup from "./components/NewsletterSignup";
import About from "./components/About";
import Footer from "./components/Footer";
import ProductDetails from "./components/ProductDetails";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";

// Toast notification
function Toast({ message, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 border border-white/10 text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-2xl max-w-xs"
    >
      <span className="text-emerald-400 text-base">✓</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-gray-600 hover:text-gray-300 text-xs">✕</button>
    </motion.div>
  );
}

export default function App() {
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  function handleAddToCart(book) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === book.id);
      if (existing) {
        return prev.map((item) =>
          item.id === book.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...book, qty: 1 }];
    });

    setToast(`"${book.title}" added to cart!`);
    setTimeout(() => setToast(null), 2500);
  }

  function handleRemoveFromCart(bookId) {
    setCart((prev) => prev.filter((item) => item.id !== bookId));
    setToast("Item removed from cart");
    setTimeout(() => setToast(null), 2500);
  }

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const handleCheckoutClose = () => {
    setCheckoutOpen(false);
    setCart([]);
    setToast("Order placed successfully! Thank you for shopping.");
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <>
      <Navbar cartCount={cartCount} onCartClick={() => setCartOpen(!cartOpen)} />
      <main>
        <Hero />
        <Shop onAddToCart={handleAddToCart} onViewDetails={(id) => setSelectedProductId(id)} />
        <ReviewsSection />
        <NewsletterSignup />
        <About />
      </main>
      <Footer />

      {/* Modals */}
      <AnimatePresence>
        {selectedProductId && (
          <ProductDetails
            key="product-details"
            productId={selectedProductId}
            onClose={() => setSelectedProductId(null)}
            onAddToCart={(book) => {
              handleAddToCart(book);
              setSelectedProductId(null);
            }}
          />
        )}

        {cartOpen && (
          <Cart
            key="cart"
            isOpen={cartOpen}
            items={cart}
            onClose={() => setCartOpen(false)}
            onCheckout={handleCheckout}
          />
        )}

        {checkoutOpen && (
          <Checkout
            key="checkout"
            isOpen={checkoutOpen}
            items={cart}
            total={cartTotal}
            onClose={handleCheckoutClose}
          />
        )}

        {toast && (
          <Toast
            key="toast"
            message={toast}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
