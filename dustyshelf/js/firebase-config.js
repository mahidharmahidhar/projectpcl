import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBL-yws4_jmKKEIuy4_98zqeWSf9XSsevc",
  authDomain: "projectpcl-e018c.firebaseapp.com",
  projectId: "projectpcl-e018c",
  storageBucket: "projectpcl-e018c.firebasestorage.app",
  messagingSenderId: "397251005254",
  appId: "1:397251005254:web:6f7e4f862906972808f347",
  measurementId: "G-KLTMBW6N14"
};

export const app = initializeApp(firebaseConfig);
console.log("🔥 Firebase App Initialized:", app.name);

export const db = getFirestore(app);
console.log("🔥 Firestore Initialized");

export const auth = getAuth(app);
console.log("🔥 Firebase Auth Initialized");
