import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedBooks() {
  console.log("Starting upload...");

  await addDoc(collection(db, "books"), {
    title: "Atomic Habits",
    price: 300
  });

  console.log("Upload complete ✅");
}

seedBooks();
