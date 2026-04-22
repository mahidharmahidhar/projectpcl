// ── checkout.js ───────────────────────────────────────────────────────────────
// Checkout: address form, payment selection, order placement
// ─────────────────────────────────────────────────────────────────────────────

import { requireAuth } from "./auth.js";
import { getCart, cartTotal, clearCart, updateCartBadge } from "./cart.js";
import { showToast } from "./toast.js";
import { API_BASE_URL, RAZORPAY_KEY_ID } from "./config.js";
import { getStoredUser } from "./auth.js";

const ORDER_KEY = "last_order";

// ── Random order ID ───────────────────────────────────────────────────────────
function generateOrderId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "DS-";
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

// ── Init ──────────────────────────────────────────────────────────────────────
export function initCheckout() {
  requireAuth();
  updateCartBadge();
  renderOrderSummary();
  setupPaymentCards();
  setupPlaceOrder();
}

// ── Order summary ─────────────────────────────────────────────────────────────
function renderOrderSummary() {
  const cart = getCart();
  const container = document.getElementById("order-summary-items");
  const totalEl = document.getElementById("order-total");
  if (!container) return;

  if (!cart.length) {
    container.innerHTML = `<p class="text-gray-400 text-sm text-center py-4">Your cart is empty.</p>`;
    if (totalEl) totalEl.textContent = "₹0.00";
    return;
  }

  container.innerHTML = cart
    .map(
      (item) => `
    <div class="flex items-center gap-3 py-2 border-b border-white/10">
      <img src="${item.cover}" alt="${item.title}" class="w-10 h-14 object-cover rounded" />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-white truncate">${item.title}</p>
        <p class="text-xs text-gray-400">${item.author}</p>
        <p class="text-xs text-indigo-400">Qty: ${item.qty}</p>
      </div>
      <p class="text-sm font-semibold text-white">₹${(item.price * item.qty).toFixed(2)}</p>
    </div>`
    )
    .join("");

  const total = cartTotal();
  if (totalEl) totalEl.textContent = `₹${total.toFixed(2)}`;
}

// ── Payment cards ─────────────────────────────────────────────────────────────
let selectedPayment = null;

function setupPaymentCards() {
  document.querySelectorAll(".payment-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".payment-card").forEach((c) => {
        c.classList.remove("ring-2", "ring-indigo-500", "bg-indigo-500/10");
      });
      card.classList.add("ring-2", "ring-indigo-500", "bg-indigo-500/10");
      selectedPayment = card.dataset.method;
    });
  });
}

// ── Place order ───────────────────────────────────────────────────────────────
function setupPlaceOrder() {
  const btn = document.getElementById("place-order-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const fields = ["full-name", "phone", "pincode", "city", "address"];
    const address = {};
    let valid = true;

    fields.forEach((id) => {
      const el = document.getElementById(id);
      if (!el || !el.value.trim()) {
        valid = false;
        el?.classList.add("ring-2", "ring-red-500");
      } else {
        el.classList.remove("ring-2", "ring-red-500");
        address[id] = el.value.trim();
      }
    });

    if (!valid) {
      showToast("Please fill in all delivery details.", "error");
      return;
    }

    if (!selectedPayment) {
      showToast("Please select a payment method.", "error");
      return;
    }

    const cart = getCart();
    if (!cart.length) {
      showToast("Your cart is empty!", "error");
      return;
    }

    const user = getStoredUser();
    if (!user || !user.token) {
      showToast("Please log in to place an order.", "error");
      return;
    }

    btn.textContent = "Processing...";
    btn.disabled = true;

    try {
      if (selectedPayment === "razorpay") {
        // 1. Create order on backend to get Razorpay Order ID
        const orderRes = await fetch(`${API_BASE_URL}/payment/create-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}`
          },
          body: JSON.stringify({ amount: cartTotal(), currency: "INR" })
        });
        const orderData = await orderRes.json();

        if (!orderData.success) throw new Error(orderData.message);

        // 2. Open Razorpay Checkout
        const options = {
          key: RAZORPAY_KEY_ID,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: "DustyShelf",
          description: "Book Purchase",
          order_id: orderData.order.id,
          handler: async function (response) {
            // 3. Verify payment on backend
            const verifyRes = await fetch(`${API_BASE_URL}/payment/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId: orderData.order.id // Use internal ID if needed
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              clearCart();
              window.location.href = "success.html";
            } else {
              showToast("Payment verification failed.", "error");
            }
          },
          prefill: {
            name: address["full-name"],
            email: user.email,
            contact: address["phone"]
          },
          theme: { color: "#6366f1" }
        };

        const rzp = new Razorpay(options);
        rzp.open();
      } else {
        // Handle COD or other methods
        const res = await fetch(`${API_BASE_URL}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}`
          },
          body: JSON.stringify({
            orderItems: cart,
            shippingAddress: address,
            totalAmount: cartTotal()
          })
        });
        const data = await res.json();
        if (data.success) {
          clearCart();
          window.location.href = "success.html";
        } else {
          throw new Error(data.message);
        }
      }
    } catch (err) {
      showToast(err.message || "An error occurred.", "error");
      btn.textContent = "Place Order";
      btn.disabled = false;
    }
  });
}
