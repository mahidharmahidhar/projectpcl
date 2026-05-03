// src/components/SellerSettings.jsx
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function SellerSettings() {
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSellerUPI();
  }, []);

  const fetchSellerUPI = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/payment/seller-upi", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setUpiId(data.upiId || "");
      }
    } catch (err) {
      setError("Failed to load UPI settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!upiId.trim()) {
      setError("Please enter a UPI ID");
      return;
    }

    if (!upiId.includes("@")) {
      setError("Invalid UPI ID format (e.g., 9999999999@paytm)");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/payment/update-seller-upi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ upiId })
      });

      const data = await response.json();
      if (data.success) {
        setMessage("UPI ID updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError(data.message || "Failed to update UPI ID");
      }
    } catch (err) {
      setError(err.message || "Error saving UPI ID");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin">
          <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto p-6 bg-gradient-to-br from-gray-900 to-gray-950 border border-white/10 rounded-2xl shadow-2xl"
    >
      <h2 className="text-2xl font-bold text-white mb-6">UPI Payment Settings</h2>

      {message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-200"
        >
          {message}
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200"
        >
          {error}
        </motion.div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-white mb-3">UPI ID</label>
          <p className="text-xs text-gray-400 mb-3">
            Enter your UPI ID where customers will send payments. Format: 9999999999@upi_provider
            <br />
            Examples: 9999999999@paytm, name@okhdfcbank, email@okaxis
          </p>
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="e.g., 9999999999@paytm"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20"
        >
          {saving ? "Saving..." : "Save UPI ID"}
        </button>

        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-200">
            <strong>Note:</strong> Make sure to verify your UPI ID is correct. Customers will use this to send payments for your books.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
