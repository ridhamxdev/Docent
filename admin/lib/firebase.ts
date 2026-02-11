import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBsddaeEoLU5bCzaDZuWiCBn6zpL-mQ3DU",
  authDomain: "docent-platform.firebaseapp.com",
  projectId: "docent-platform",
  storageBucket: "docent-platform.firebasestorage.app",
  messagingSenderId: "1069461065604",
  appId: "1:1069461065604:web:0dbdee01fae2ac0bd057d1"
};

// Initialize Firebase (checking if already initialized for server-side rendering safety)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
