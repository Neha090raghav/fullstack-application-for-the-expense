import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzO-AHCwlO525N_IqrlsqXSwxnXorP7gs",
  authDomain: "expensebackend-4f9be.firebaseapp.com",
  projectId: "expensebackend-4f9be",
  storageBucket: "expensebackend-4f9be.firebasestorage.app",
  messagingSenderId: "340071619355",
  appId: "1:340071619355:web:65ab9d8d2d1e553a6bd1be",
  measurementId: "G-KZ0YX5K443"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
