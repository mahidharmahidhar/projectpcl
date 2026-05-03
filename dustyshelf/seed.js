// seed.js — Run with: node seed.js
// This script takes the static books array and uploads it directly to your Firebase Firestore Database

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

// ── PASTE YOUR FIREBASE CONFIG HERE ─────────────────────────────────────────
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID",
};
const ADMIN_EMAIL = "your-admin-email@example.com";
const ADMIN_PASSWORD = "your-password";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Your static books array
const BOOKS = [
  { id: "1", title: "Engineering Mathematics", author: "Dr. B.S. Grewal", category: "UG", price: 650, condition: "Like New", image: "https://covers.openlibrary.org/b/id/10527843-L.jpg", rating: 4.8, reviews: 120 },
  { id: "2", title: "Fundamentals of Physics", author: "Halliday & Resnick", category: "UG", price: 850, condition: "Good", image: "https://covers.openlibrary.org/b/id/8575708-L.jpg", rating: 4.7, reviews: 85 },
  { id: "3", title: "Advanced Engineering Mathematics", author: "Erwin Kreyszig", category: "PG", price: 950, condition: "Like New", image: "https://covers.openlibrary.org/b/id/8714263-L.jpg", rating: 4.9, reviews: 200 },
  { id: "4", title: "Research Methodology", author: "C.R. Kothari", category: "PG", price: 450, condition: "Acceptable", image: "https://covers.openlibrary.org/b/id/8228691-L.jpg", rating: 4.5, reviews: 60 },
  { id: "5", title: "Rich Dad Poor Dad", author: "Robert T. Kiyosaki", category: "Commerce", price: 399, condition: "New", image: "https://covers.openlibrary.org/b/id/10286124-L.jpg", rating: 4.8, reviews: 500 },
  { id: "6", title: "Principles of Accounting", author: "Needles & Powers", category: "Commerce", price: 550, condition: "Good", image: "https://covers.openlibrary.org/b/id/8739161-L.jpg", rating: 4.6, reviews: 90 },
  { id: "7", title: "Python Crash Course", author: "Eric Matthes", category: "Programming", price: 799, condition: "Like New", image: "https://covers.openlibrary.org/b/id/10110415-L.jpg", rating: 4.9, reviews: 320 },
  { id: "8", title: "Clean Code", author: "Robert C. Martin", category: "Programming", price: 899, condition: "Good", image: "https://covers.openlibrary.org/b/id/8257091-L.jpg", rating: 4.9, reviews: 450 },
  { id: "9", title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", category: "History", price: 499, condition: "Like New", image: "https://covers.openlibrary.org/b/id/10451983-L.jpg", rating: 4.8, reviews: 600 },
  { id: "10", title: "Dune", author: "Frank Herbert", category: "Science Fiction", price: 550, condition: "Good", image: "https://covers.openlibrary.org/b/id/8228228-L.jpg", rating: 4.8, reviews: 410 },
  { id: "11", title: "Atomic Habits", author: "James Clear", category: "Lifestyle", price: 450, condition: "New", image: "https://covers.openlibrary.org/b/id/8746169-L.jpg", rating: 4.9, reviews: 800 },
  { id: "12", title: "Shoe Dog", author: "Phil Knight", category: "Sports", price: 399, condition: "Good", image: "https://covers.openlibrary.org/b/id/8302946-L.jpg", rating: 4.7, reviews: 250 },
  { id: "13", title: "Steve Jobs", author: "Walter Isaacson", category: "Biography", price: 699, condition: "Like New", image: "https://covers.openlibrary.org/b/id/12290670-L.jpg", rating: 4.8, reviews: 380 },
  { id: "14", title: "Wings of Fire", author: "A.P.J. Abdul Kalam", category: "Biography", price: 299, condition: "New", image: "https://covers.openlibrary.org/b/id/9257016-L.jpg", rating: 4.9, reviews: 900 },
  { id: "15", title: "The Martian", author: "Andy Weir", category: "Science Fiction", price: 450, condition: "Like New", image: "https://covers.openlibrary.org/b/id/10475456-L.jpg", rating: 4.8, reviews: 340 }
];

async function seed() {
  console.log(`📚 Authenticating with Firebase...`);
  try {
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log(`✅ Successfully logged in as: ${ADMIN_EMAIL}`);
  } catch (error) {
    console.error("❌ Authentication Failed! Please check your ADMIN_EMAIL and ADMIN_PASSWORD.");
    console.error(error.message);
    process.exit(1);
  }

  console.log(`\n📚 Starting upload of ${BOOKS.length} books to Firebase...`);

  let done = 0;
  for (const book of BOOKS) {
    try {
      await addDoc(collection(db, "books"), {
        title: book.title,
        author: book.author,
        category: book.category,
        price: book.price,
        condition: book.condition,
        image: book.image,
        rating: book.rating,
        reviews: book.reviews,
        createdAt: serverTimestamp()
      });
      done++;
      console.log(`  ✅ Uploaded: ${book.title}`);
    } catch (e) {
      console.error(`  ❌ Failed at book "${book.title}":`, e.message);
    }
  }

  console.log(`\n🎉 Done! ${done} books added to Firestore.`);
  process.exit(0);
}

seed();
