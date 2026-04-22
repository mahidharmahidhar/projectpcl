// ── cart.js ───────────────────────────────────────────────────────────────────
// Cart CRUD helpers with Backend Sync
// ─────────────────────────────────────────────────────────────────────────────
import { API_BASE_URL } from "./config.js";
import { getStoredUser } from "./auth.js";

export const CART_KEY = "verdura_cart";

// ── Raw access ────────────────────────────────────────────────────────────────
export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

// ── Mutations ─────────────────────────────────────────────────────────────────
export async function addToCart(book) {
  const cart = getCart();
  const idx = cart.findIndex((i) => i.id === book.id || i._id === book._id);
  if (idx > -1) {
    cart[idx].qty = (cart[idx].qty || 1) + 1;
  } else {
    cart.push({ ...book, qty: 1 });
  }
  saveCart(cart);

  // Backend sync
  const user = getStoredUser();
  if (user && user.token) {
    await fetch(`${API_BASE_URL}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user.token}`
      },
      body: JSON.stringify({ bookId: book.id || book._id, quantity: 1 })
    });
  }
}

export async function removeFromCart(bookId) {
  saveCart(getCart().filter((i) => i.id !== bookId && i._id !== bookId));

  const user = getStoredUser();
  if (user && user.token) {
    await fetch(`${API_BASE_URL}/cart/remove/${bookId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${user.token}` }
    });
  }
}

export function updateQty(bookId, delta) {
  const cart = getCart();
  const idx = cart.findIndex((i) => i.id === bookId);
  if (idx === -1) return;
  cart[idx].qty = Math.max(1, (cart[idx].qty || 1) + delta);
  saveCart(cart);
}

// ── Calculated ────────────────────────────────────────────────────────────────
export function cartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * (i.qty || 1), 0);
}

export function cartCount() {
  return getCart().reduce((sum, i) => sum + (i.qty || 1), 0);
}

// ── Badge helper ──────────────────────────────────────────────────────────────
export function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  if (!badge) return;
  const count = cartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? "flex" : "none";
}
