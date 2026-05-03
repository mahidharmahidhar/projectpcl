// ── auth.js ──────────────────────────────────────────────────────────────────
// Firebase Auth: Registration, Login, Google Sign-In, Session Management,
// Forgot Password, Profile Management, Login History, Validation Helpers
// ─────────────────────────────────────────────────────────────────────────────

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, setDoc, getDoc, updateDoc, arrayUnion,
  collection, query, where, orderBy, getDocs, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

const provider = new GoogleAuthProvider();

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION HELPERS — used by both frontend and auth functions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validate Indian mobile number.
 * Accepts: +91XXXXXXXXXX, 91XXXXXXXXXX, 0XXXXXXXXXX, XXXXXXXXXX
 * Must be 10 digits starting with 6-9.
 */
export function validateIndianPhone(phone) {
  if (!phone) return { valid: false, message: "Phone number is required." };
  // Strip spaces, dashes, dots
  const cleaned = phone.replace(/[\s\-\.]/g, "");
  // Match Indian patterns
  const patterns = [
    /^\+91[6-9]\d{9}$/,    // +91 followed by 10 digits
    /^91[6-9]\d{9}$/,      // 91 followed by 10 digits
    /^0[6-9]\d{9}$/,       // 0 followed by 10 digits
    /^[6-9]\d{9}$/          // Direct 10 digits
  ];
  const isValid = patterns.some(p => p.test(cleaned));
  if (!isValid) {
    return { valid: false, message: "Enter valid Indian mobile number (10 digits starting with 6-9)." };
  }
  // Normalize to +91 format
  let normalized = cleaned;
  if (normalized.startsWith("+91")) normalized = normalized;
  else if (normalized.startsWith("91") && normalized.length === 12) normalized = "+" + normalized;
  else if (normalized.startsWith("0")) normalized = "+91" + normalized.slice(1);
  else normalized = "+91" + normalized;
  return { valid: true, normalized, message: "Valid Indian mobile number." };
}

/**
 * Validate email format.
 */
export function validateEmail(email) {
  if (!email) return { valid: false, message: "Email is required." };
  const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!re.test(email)) return { valid: false, message: "Invalid email format." };
  return { valid: true, message: "Valid email." };
}

/**
 * Check if email already exists in Firebase Auth.
 */
export async function checkEmailExists(email) {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    // Firebase may return empty array even for existing emails (enumeration protection)
    // We still try — if it returns methods, the email is taken
    return methods.length > 0;
  } catch {
    // If error, we can't determine — let registration attempt handle it
    return false;
  }
}

/**
 * Validate password strength.
 * Min 8 chars, uppercase, lowercase, number, special character.
 */
export function validatePassword(password) {
  const errors = [];
  if (!password) return { valid: false, strength: 0, errors: ["Password is required."], message: "Password is required." };
  if (password.length < 8) errors.push("Minimum 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("At least 1 uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("At least 1 lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("At least 1 number");
  if (!/[^A-Za-z0-9]/.test(password)) errors.push("At least 1 special character (!@#$%...)");

  // Strength calculation: 0-4
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const labels = ["Weak", "Fair", "Good", "Strong"];
  const isValid = errors.length === 0;
  return {
    valid: isValid,
    strength,
    label: strength > 0 ? labels[strength - 1] : "Too Weak",
    errors,
    message: isValid ? "Strong password!" : errors[0]
  };
}

/**
 * Validate full name.
 */
export function validateName(name) {
  if (!name || name.trim().length < 2) return { valid: false, message: "Full name must be at least 2 characters." };
  if (!/^[a-zA-Z\s'.]+$/.test(name.trim())) return { valid: false, message: "Name can only contain letters, spaces, and apostrophes." };
  return { valid: true, message: "Valid name." };
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIREBASE ERROR MESSAGE MAPPING — user-friendly error messages
// ═══════════════════════════════════════════════════════════════════════════════

function mapFirebaseError(error) {
  const code = error.code || "";
  const msg = error.message || "";
  const map = {
    "auth/email-already-in-use": "Email already registered. Please login instead.",
    "auth/invalid-email": "Invalid email format.",
    "auth/operation-not-allowed": "Email/password sign-in is not enabled. Contact support.",
    "auth/weak-password": "Password is too weak. Use at least 8 characters with mixed types.",
    "auth/user-disabled": "This account has been disabled. Contact support.",
    "auth/user-not-found": "User not found. Please register first.",
    "auth/wrong-password": "Invalid password. Please try again.",
    "auth/invalid-credential": "Invalid email or password. Please check and try again.",
    "auth/too-many-requests": "Too many failed attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Please check your internet connection.",
    "auth/popup-closed-by-user": "Sign-in popup was closed. Please try again.",
    "auth/cancelled-popup-request": "Sign-in cancelled.",
    "auth/account-exists-with-different-credential": "An account already exists with this email using a different sign-in method.",
    // App Check errors — show user-friendly message instead of raw 403
    "appCheck/fetch-status-error": "Service temporarily unavailable. Please try again in a moment.",
    "auth/firebase-app-check-token-is-invalid": "Service temporarily unavailable. Please try again in a moment.",
    "appCheck/token-not-found": "Service temporarily unavailable. Please try again.",
  };
  // Check for App Check errors in the message text as well
  if (msg.includes("app-check") || msg.includes("appCheck") || msg.includes("App Check") || msg.includes("403")) {
    return "Service temporarily unavailable. Please try again in a moment.";
  }
  return map[code] || msg || "An unexpected error occurred.";
}

// ═══════════════════════════════════════════════════════════════════════════════
// SESSION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export function initAuthState(onUserChanged) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // For Google sign-in, email is auto-verified
      if (!user.emailVerified && user.providerData[0]?.providerId !== "google.com") {
        onUserChanged(null);
        return;
      }

      let userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email.split("@")[0],
        image: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=1A3C34&color=FDFCF8&bold=true`,
        role: "user",
        phone: "",
      };

      // Try to fetch extra data from Firestore (may fail if App Check is enforced)
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const dbData = userDoc.data();
          userData.role = dbData.role || "user";
          userData.phone = dbData.phone || "";
          userData.name = dbData.name || userData.name;
        }
      } catch (e) {
        console.warn("Could not fetch Firestore profile (App Check may be enforced):", e.message);
        // Fall back to cached data if available
        const cached = getCurrentUser();
        if (cached && cached.uid === user.uid) {
          userData = { ...userData, ...cached };
        }
      }

      localStorage.setItem("dustyshelf_user", JSON.stringify(userData));
      onUserChanged(userData);
    } else {
      localStorage.removeItem("dustyshelf_user");
      onUserChanged(null);
    }
  });
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("dustyshelf_user"));
  } catch {
    return null;
  }
}

// ── Route guard ───────────────────────────────────────────────────────────────
export function requireAuth(redirectTo = "login.html") {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = redirectTo;
    return null;
  }
  return user;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIRESTORE USER DOCUMENT — complete data isolation per user
// ═══════════════════════════════════════════════════════════════════════════════

async function saveUserToFirestore(user, extraData = {}) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      name: extraData.name || user.displayName || user.email.split("@")[0],
      phone: extraData.phone || "",
      role: "user",
      addresses: [],
      loginHistory: [],
      registeredAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
  }
}

// ── Record login event ────────────────────────────────────────────────────────
async function recordLogin(uid) {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      lastLoginAt: new Date().toISOString(),
      loginHistory: arrayUnion({
        timestamp: new Date().toISOString(),
        device: navigator.userAgent.slice(0, 100),
        platform: navigator.platform || "Unknown"
      })
    });
  } catch (e) {
    console.warn("Could not record login:", e);
  }
}

// ── Update user profile ───────────────────────────────────────────────────────
export async function updateUserProfile(uid, data) {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, data);
  const current = getCurrentUser();
  if (current && current.uid === uid) {
    const updated = { ...current, ...data };
    localStorage.setItem("dustyshelf_user", JSON.stringify(updated));
  }
}

// ── Get user profile ──────────────────────────────────────────────────────────
export async function getUserProfile(uid) {
  const userDoc = await getDoc(doc(db, "users", uid));
  return userDoc.exists() ? userDoc.data() : null;
}

// ── Get user orders ───────────────────────────────────────────────────────────
export async function getUserOrders(uid) {
  const q = query(
    collection(db, "orders"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Save address ──────────────────────────────────────────────────────────────
export async function saveAddress(uid, address) {
  const profile = await getUserProfile(uid);
  const addresses = profile?.addresses || [];
  addresses.push({ ...address, id: Date.now().toString() });
  await updateDoc(doc(db, "users", uid), { addresses });
  return addresses;
}

// ── Delete address ────────────────────────────────────────────────────────────
export async function deleteAddress(uid, addressId) {
  const profile = await getUserProfile(uid);
  const addresses = (profile?.addresses || []).filter(a => a.id !== addressId);
  await updateDoc(doc(db, "users", uid), { addresses });
  return addresses;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION METHODS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Google Sign-In ────────────────────────────────────────────────────────────
// If new user → auto-creates profile. If existing → logs in directly.
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    
    // Save to Firestore (non-blocking — don't break login if Firestore fails)
    try {
      await saveUserToFirestore(result.user, { name: result.user.displayName });
      await recordLogin(result.user.uid);
    } catch (e) {
      console.warn("Firestore save skipped during Google login:", e.message);
    }

    // Pre-populate session
    const userData = {
      uid: result.user.uid,
      email: result.user.email,
      name: result.user.displayName || result.user.email.split("@")[0],
      image: result.user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(result.user.displayName || result.user.email)}&background=1A3C34&color=FDFCF8&bold=true`,
      role: "user",
      phone: "",
    };
    localStorage.setItem("dustyshelf_user", JSON.stringify(userData));

    return result.user;
  } catch (error) {
    console.error("Firebase Google Auth Error Detail:", error);
    throw new Error(mapFirebaseError(error));
  }
}

// ── Email/Password Registration ───────────────────────────────────────────────
// Creates a brand new Firebase account + Firestore profile document.
// Every new registration = fully isolated user account.
export async function signUpWithEmail(email, password, name, phone = "") {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(result.user, { displayName: name });
    }

    // Save user profile to Firestore with all details
    await saveUserToFirestore(result.user, { name, phone });

    // Send Email Verification (welcome email notification)
    await sendEmailVerification(result.user);

    // Sign out to force login after verification
    await signOut(auth);

    return result.user;
  } catch (error) {
    throw new Error(mapFirebaseError(error));
  }
}

// ── Email/Password Sign-In ────────────────────────────────────────────────────
export async function signInWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);

    // Note: Email verification check is relaxed for development.
    // Uncomment the block below for production to enforce verification.
    // if (!result.user.emailVerified) {
    //   await signOut(auth);
    //   throw { code: "auth/email-not-verified", message: "Please verify your email before logging in." };
    // }

    // Record login in history (non-blocking — don't let Firestore errors break login)
    try {
      await recordLogin(result.user.uid);
    } catch (e) {
      console.warn("Could not record login history:", e.message);
    }

    // Pre-populate localStorage session immediately so dashboard loads fast
    let userData = {
      uid: result.user.uid,
      email: result.user.email,
      name: result.user.displayName || result.user.email.split("@")[0],
      image: result.user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(result.user.displayName || result.user.email)}&background=1A3C34&color=FDFCF8&bold=true`,
      role: "user",
      phone: "",
    };

    // Try to get Firestore data for richer profile (non-blocking)
    try {
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (userDoc.exists()) {
        const dbData = userDoc.data();
        userData.role = dbData.role || "user";
        userData.phone = dbData.phone || "";
        userData.name = dbData.name || userData.name;
      }
    } catch (e) {
      console.warn("Could not fetch Firestore profile during login:", e.message);
    }

    localStorage.setItem("dustyshelf_user", JSON.stringify(userData));

    return result.user;
  } catch (error) {
    if (error.code === "auth/email-not-verified") throw new Error(error.message);
    throw new Error(mapFirebaseError(error));
  }
}

// ── Forgot Password ──────────────────────────────────────────────────────────
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    throw new Error(mapFirebaseError(error));
  }
}

// ── Sign-out ──────────────────────────────────────────────────────────────────
export async function logOut() {
  await signOut(auth);
  localStorage.removeItem("dustyshelf_user");
  // Clean up old shared cart key to prevent data leaking between users
  localStorage.removeItem("dustyshelf_cart");
}

// ── Populate navbar UI ────────────────────────────────────────────────────────
export function populateNavUser(user) {
  const img = document.getElementById("nav-avatar");
  const name = document.getElementById("nav-name");
  const loginBtn = document.getElementById("nav-login-btn");
  const profileDropdown = document.getElementById("nav-profile-dropdown");

  if (user) {
    if (img && user.image) img.src = user.image;
    if (name && user.name) name.textContent = `Hi, ${user.name.split(" ")[0]}`;
    if (loginBtn) loginBtn.style.display = "none";
    if (profileDropdown) profileDropdown.style.display = "block";
  } else {
    if (loginBtn) loginBtn.style.display = "block";
    if (profileDropdown) profileDropdown.style.display = "none";
  }
}
