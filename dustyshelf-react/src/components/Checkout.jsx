// src/components/Checkout.jsx
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function Checkout({ isOpen, items, total, onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateQR = async () => {
    if (!formData.fullName || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      setError("Please fill in all shipping address fields");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Get first book for payment (in real app, would calculate per seller)
      const bookId = items[0]?.id;

      const response = await fetch("http://localhost:5000/api/payment/generate-upi-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          bookId,
          quantity: items[0]?.qty || 1,
          amount: total
        })
      });

      const data = await response.json();

      if (data.success) {
        setQrData(data);
        setStep(2);
      } else {
        setError(data.message || "Failed to generate QR code");
      }
    } catch (err) {
      setError(err.message || "Error generating QR code");
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async () => {
    if (!transactionId.trim()) {
      setError("Please enter the UPI transaction ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/payment/verify-upi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          orderId: qrData.orderId,
          upiTransactionId: transactionId
        })
      });

      const data = await response.json();

      if (data.success) {
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
          });
          setTransactionId("");
          setQrData(null);
        }, 3000);
      } else {
        setError(data.message || "Payment verification failed");
      }
    } catch (err) {
      setError(err.message || "Error verifying payment");
    } finally {
      setLoading(false);
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
          <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
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
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {step === 1 ? "Shipping Details" : "UPI Payment"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            {/* Form / QR Code */}
            <div className="md:col-span-2 space-y-6">
              {step === 1 ? (
                <>
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Street Address"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="City"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="State"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="Pincode"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <button
                    onClick={generateQR}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20"
                  >
                    {loading ? "Generating..." : "Proceed to Payment"}
                  </button>
                </>
              ) : (
                <>
                  {/* QR Code Section */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Seller Information</h3>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
                        <p className="text-gray-300"><span className="text-white font-semibold">Seller:</span> {qrData?.sellerName}</p>
                        <p className="text-gray-300"><span className="text-white font-semibold">UPI ID:</span> {qrData?.upiId}</p>
                        <p className="text-gray-300"><span className="text-white font-semibold">Amount:</span> ₹{qrData?.amount}</p>
                        <p className="text-gray-300"><span className="text-white font-semibold">Book:</span> {qrData?.bookTitle}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 text-center">Scan QR Code to Pay</h3>
                      <div className="bg-white p-6 rounded-xl flex justify-center mx-auto w-fit">
                        {qrData && (
                          <QRCodeSVG
                            value={`upi://pay?pa=${qrData.upiId}&pn=${encodeURIComponent(qrData.sellerName)}&am=${qrData.amount}&tn=BookPurchase`}
                            size={256}
                            level="H"
                            includeMargin={true}
                          />
                        )}
                      </div>
                    </div>

                    {/* Transaction ID Input */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Enter UPI Transaction ID
                      </label>
                      <p className="text-xs text-gray-400 mb-2">
                        After payment, enter the transaction reference number from your UPI app
                      </p>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g., 123456789012345"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <button
                      onClick={verifyPayment}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20"
                    >
                      {loading ? "Verifying..." : "Verify Payment"}
                    </button>

                    <button
                      onClick={() => setStep(1)}
                      disabled={loading}
                      className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white font-semibold py-2 rounded-xl transition-all duration-200"
                    >
                      Back
                    </button>
                  </div>
                </>
              )}
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
