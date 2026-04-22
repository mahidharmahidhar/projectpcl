// src/components/Checkout.jsx
import { motion } from "framer-motion";
import { useState } from "react";

export default function Checkout({ isOpen, items, total, onClose }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = () => {
    if (
      formData.fullName &&
      formData.address &&
      formData.city &&
      formData.state &&
      formData.pincode &&
      formData.cardNumber &&
      formData.expiry &&
      formData.cvv
    ) {
      setOrderPlaced(true);
      setTimeout(() => {
        onClose();
        setOrderPlaced(false);
        setStep(1);
        setFormData({
          email: "",
          fullName: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
          cardNumber: "",
          expiry: "",
          cvv: "",
        });
      }, 3000);
    }
  };

  if (!isOpen) return null;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  if (orderPlaced) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-br from-gray-900 to-gray-950 border border-emerald-500/30 rounded-2xl max-w-md w-full p-8 text-center shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mb-6"
          >
            <svg className="w-16 h-16 text-emerald-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-2">Order Confirmed!</h3>
          <p className="text-gray-400 mb-6">Thank you for your purchase. Your books will be delivered soon.</p>
          <p className="text-sm text-gray-500">Redirecting...</p>
        </motion.div>
      </motion.div>
    );
  }

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
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Checkout</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Form */}
            <div className="md:col-span-2 space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Shipping Address</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street Address"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Pincode"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Payment */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="Card Number"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="expiry"
                      value={formData.expiry}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="CVV"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20"
              >
                Place Order (₹{total.toLocaleString()})
              </button>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-1">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 sticky top-6">
                <h4 className="text-lg font-semibold text-white mb-4">Order Summary</h4>
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-300">
                      <span>{item.title}</span>
                      <span>x{item.qty}</span>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-white/10 mb-4" />
                <div className="flex justify-between font-bold text-white">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
