// ── cart.js ───────────────────────────────────────────────────────────────────
// User-isolated cart system. Each user gets their own private cart
// stored under a unique localStorage key: dustyshelf_cart_{uid}
//
// User A → dustyshelf_cart_abc123  (only User A's items)
// User B → dustyshelf_cart_xyz456  (only User B's items)
// No data mixing. No shared state. Complete isolation.
// ─────────────────────────────────────────────────────────────────────────────

import { getCurrentUser } from "./auth.js";

/**
 * Get the user-specific cart storage key.
 * Returns null if no user is logged in.
 */
function getCartKey() {
  const user = getCurrentUser();
  if (!user || !user.uid) return null;
  return `dustyshelf_cart_${user.uid}`;
}

/**
 * Get the current user's cart.
 * Returns empty array if not logged in or cart is empty.
 */
export function getCart() {
  const key = getCartKey();
  if (!key) return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

/**
 * Save the current user's cart.
 * Only saves if a user is logged in.
 */
export function saveCart(cart) {
  const key = getCartKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(cart));
}

/**
 * Add a book to the current user's cart.
 * Returns { success, message } for UI feedback.
 */
export function addToCart(book) {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, message: "Please log in to add items to cart.", redirect: "login.html" };
  }

  const cart = getCart();
  const idx = cart.findIndex(i => i.id === book.id);
  if (idx > -1) {
    cart[idx].qty += 1;
  } else {
    cart.push({ ...book, qty: 1, addedAt: new Date().toISOString() });
  }
  saveCart(cart);
  return { success: true, message: `"${book.title}" added to cart!` };
}

/**
 * Remove a book from the current user's cart.
 */
export function removeFromCart(bookId) {
  const cart = getCart().filter(i => i.id !== bookId);
  saveCart(cart);
  return cart;
}

/**
 * Update quantity of a book in the user's cart.
 * If qty goes below 1, removes the item.
 */
export function updateQty(bookId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === bookId);
  if (!item) return cart;
  item.qty += delta;
  if (item.qty < 1) {
    return removeFromCart(bookId);
  }
  saveCart(cart);
  return cart;
}

/**
 * Clear the current user's cart completely.
 */
export function clearCart() {
  const key = getCartKey();
  if (key) localStorage.removeItem(key);
}

/**
 * Get the total item count in the current user's cart.
 */
export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

/**
 * Get the total price of the current user's cart.
 */
export function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

/**
 * Update the cart badge on the navbar.
 */
export function updateCartBadge() {
  const count = getCartCount();
  const badge = document.getElementById("cart-badge");
  if (!badge) return;
  if (count > 0) {
    badge.style.display = "flex";
    badge.textContent = count;
  } else {
    badge.style.display = "none";
  }
}

/**
 * Migrate any old shared cart data to the current user's cart.
 * Call this once after login to rescue orphaned cart items.
 * After migration, the shared key is deleted permanently.
 */
export function migrateOldCart() {
  const user = getCurrentUser();
  if (!user) return;

  const oldCart = localStorage.getItem("dustyshelf_cart");
  if (oldCart) {
    try {
      const items = JSON.parse(oldCart);
      if (items.length > 0) {
        const userKey = `dustyshelf_cart_${user.uid}`;
        const existing = JSON.parse(localStorage.getItem(userKey) || "[]");
        // Merge: add old items that aren't already in user's cart
        items.forEach(item => {
          if (!existing.find(e => e.id === item.id)) {
            existing.push(item);
          }
        });
        localStorage.setItem(userKey, JSON.stringify(existing));
      }
    } catch { /* ignore parse errors */ }
    // Remove the old shared key permanently
    localStorage.removeItem("dustyshelf_cart");
  }
}
