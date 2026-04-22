// ── auth.js ──────────────────────────────────────────────────────────────────
// Firebase Auth helpers: Google sign-in, session management, route guards
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { API_BASE_URL } from "./config.js";

// ── Firebase config ───────────────────────────────────────────────────────────
// Replace with your own Firebase project credentials
const firebaseConfig = {
  apiKey: "XXXX",
  authDomain: "XXXX",
  projectId: "XXXX",
  storageBucket: "XXXX",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ── Storage key ───────────────────────────────────────────────────────────────
export const USER_KEY = "verdura_current_user";

// ── Helpers ───────────────────────────────────────────────────────────────────
export function getStoredUser() {
  try {
    const user = JSON.parse(localStorage.getItem(USER_KEY));
    const token = localStorage.getItem("token");
    return { ...user, token };
  } catch {
    return null;
  }
}

export function storeUser(user, token) {
  const data = {
    name: user.displayName || user.email.split("@")[0],
    email: user.email,
    image: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=6366f1&color=fff`,
  };
  localStorage.setItem(USER_KEY, JSON.stringify(data));
  if (token) localStorage.setItem("token", token);
  return data;
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("token");
}

// ── Route guard: call on any protected page ───────────────────────────────────
export function requireAuth(redirectTo = "login.html") {
  const user = getStoredUser();
  if (!user) {
    window.location.href = redirectTo;
    return null;
  }
  return user;
}

// ── Google sign-in ────────────────────────────────────────────────────────────
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();

  // Send token to backend
  const res = await fetch(`${API_BASE_URL}/auth/google-signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json();

  if (data.success) {
    return storeUser(result.user, data.token);
  } else {
    throw new Error(data.message || "Backend login failed");
  }
}

// ── Email/Password sign-up ────────────────────────────────────────────────────
export async function signUpWithEmail(email, password, name) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(result.user, { displayName: name });

  // Sync with backend
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name || email.split("@")[0], email, password }),
  });
  const data = await res.json();

  if (data.success) {
    return storeUser(result.user, data.token);
  } else {
    throw new Error(data.message || "Registration failed on backend");
  }
}

// ── Email/Password sign-in ────────────────────────────────────────────────────
export async function signInWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  
  // Login to backend
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();

  if (data.success) {
    return storeUser(result.user, data.token);
  } else {
    throw new Error(data.message || "Login failed on backend");
  }
}

// ── Sign-out ──────────────────────────────────────────────────────────────────
export async function logOut() {
  await signOut(auth);
  clearUser();
}

// ── Populate navbar UI ────────────────────────────────────────────────────────
export function populateNavUser(user) {
  const img = document.getElementById("nav-avatar");
  const name = document.getElementById("nav-name");
  if (img && user?.image) img.src = user.image;
  if (name && user?.name) name.textContent = `Hi, ${user.name.split(" ")[0]}`;
}
