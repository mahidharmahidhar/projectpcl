// ── ratings.js ────────────────────────────────────────────────────────────────
// User-isolated star rating system with localStorage persistence.
// Each user's ratings are stored under: dustyshelf_ratings_{uid}
// Average ratings are stored globally: dustyshelf_avg_ratings
// ─────────────────────────────────────────────────────────────────────────────

import { getCurrentUser } from "./auth.js";

/**
 * Get the user-specific ratings key.
 * Returns null if no user is logged in.
 */
function getRatingsKey() {
  const user = getCurrentUser();
  if (!user || !user.uid) return null;
  return `dustyshelf_ratings_${user.uid}`;
}

// ── Global average ratings store ────────────────────────────────────────────
const AVG_KEY = "dustyshelf_avg_ratings";

/**
 * Get all average ratings: { bookId: { total: sum, count: n, avg: computed } }
 */
function getAllAvgRatings() {
  try {
    return JSON.parse(localStorage.getItem(AVG_KEY) || "{}");
  } catch {
    return {};
  }
}

/**
 * Save the global average ratings store.
 */
function saveAllAvgRatings(data) {
  localStorage.setItem(AVG_KEY, JSON.stringify(data));
}

/**
 * Get the current user's personal ratings: { bookId: starValue }
 */
export function getUserRatings() {
  const key = getRatingsKey();
  if (!key) return {};
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

/**
 * Rate a book (1–5 stars). Updates both user and global stores.
 * @param {string} bookId – The book identifier
 * @param {number} stars  – Star value 1–5
 * @param {number} defaultRating – The book's default/static rating from catalogue
 * @returns {{ userRating: number, avgRating: number, totalRatings: number }}
 */
export function rateBook(bookId, stars, defaultRating = 0) {
  const user = getCurrentUser();
  if (!user) return null; // Must be logged in

  // Clamp to valid range
  stars = Math.max(1, Math.min(5, Math.round(stars)));

  // ── Update user's personal ratings ──────────────────────────────────
  const key = getRatingsKey();
  const userRatings = getUserRatings();
  const previousRating = userRatings[bookId] || null;
  userRatings[bookId] = stars;
  localStorage.setItem(key, JSON.stringify(userRatings));

  // ── Update global average ──────────────────────────────────────────
  const allAvg = getAllAvgRatings();
  if (!allAvg[bookId]) {
    // First ever rating for this book — seed with the catalogue default
    // We treat the catalogue rating as 1 "seed" vote
    allAvg[bookId] = { total: defaultRating, count: 1 };
  }

  if (previousRating !== null) {
    // User is changing their existing rating: subtract old, add new
    allAvg[bookId].total = allAvg[bookId].total - previousRating + stars;
  } else {
    // Brand new rating from this user
    allAvg[bookId].total += stars;
    allAvg[bookId].count += 1;
  }

  allAvg[bookId].avg = +(allAvg[bookId].total / allAvg[bookId].count).toFixed(1);
  saveAllAvgRatings(allAvg);

  return {
    userRating: stars,
    avgRating: allAvg[bookId].avg,
    totalRatings: allAvg[bookId].count,
  };
}

/**
 * Get the average rating info for a specific book.
 * Falls back to the catalogue's static rating if no user has rated yet.
 * @param {string} bookId
 * @param {number} fallbackRating – Static rating from the book catalogue
 * @returns {{ avg: number, count: number }}
 */
export function getBookRating(bookId, fallbackRating = 0) {
  const allAvg = getAllAvgRatings();
  if (allAvg[bookId]) {
    return { avg: allAvg[bookId].avg, count: allAvg[bookId].count };
  }
  // No one has rated yet — use catalogue default
  return { avg: fallbackRating, count: 0 };
}

/**
 * Get the current user's rating for a specific book (or 0 if not rated).
 */
export function getUserBookRating(bookId) {
  const ratings = getUserRatings();
  return ratings[bookId] || 0;
}

/**
 * Generate star HTML (display-only) for a given rating value.
 * @param {number} rating – e.g. 4.5
 * @param {string} size – CSS size class, e.g. "text-sm"
 * @returns {string} HTML string
 */
export function renderStars(rating, size = "text-sm") {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      // Full star
      html += `<span class="star-icon ${size}" style="color: #B8860B;">★</span>`;
    } else if (i - 0.5 <= rating) {
      // Half star (rendered as full for simplicity, slightly dimmed)
      html += `<span class="star-icon ${size}" style="color: #B8860B; opacity: 0.7;">★</span>`;
    } else {
      // Empty star
      html += `<span class="star-icon ${size}" style="color: #D4C5A9;">★</span>`;
    }
  }
  return html;
}

/**
 * Generate interactive star rating HTML for a book.
 * The stars are clickable and highlight on hover.
 * @param {string} bookId
 * @param {number} userRating – Current user's rating (0 if none)
 * @returns {string} HTML
 */
export function renderInteractiveStars(bookId, userRating = 0) {
  let html = `<div class="interactive-stars" data-book-id="${bookId}">`;
  for (let i = 1; i <= 5; i++) {
    const filled = i <= userRating;
    html += `<span class="rate-star" data-star="${i}" data-book="${bookId}" 
      style="cursor: pointer; font-size: 1.25rem; transition: all 0.15s ease; color: ${filled ? '#B8860B' : '#D4C5A9'};"
      onmouseenter="this.style.transform='scale(1.3)'" 
      onmouseleave="this.style.transform='scale(1)'"
    >★</span>`;
  }
  html += `</div>`;
  return html;
}
