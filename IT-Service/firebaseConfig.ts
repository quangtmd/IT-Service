import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDQHQl7Jt9xesz0GDbC9PUkRb8pGNa5fI",
  authDomain: "it-service-1493b.firebaseapp.com",
  projectId: "it-service-1493b",
  storageBucket: "it-service-1493b.firebasestorage.app",
  messagingSenderId: "23539684775",
  appId: "1:23539684775:web:f1317293da13605cca9282",
  measurementId: "G-MWTLGP5JBT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { app, auth, db, storage, analytics };