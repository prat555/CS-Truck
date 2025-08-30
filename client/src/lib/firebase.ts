// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDB7V9IfRjdmxwvyzOKnJIgOhcHKplQqaY",
  authDomain: "cstruck-7d1ec.firebaseapp.com",
  projectId: "cstruck-7d1ec",
  storageBucket: "cstruck-7d1ec.firebasestorage.app",
  messagingSenderId: "30469900665",
  appId: "1:30469900665:web:ebe65274de5107708987a8",
  measurementId: "G-1WBFTNJJ8R"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize analytics only in production and if available
let analytics: any = null;
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics not available:', error);
  }
}

export { analytics, RecaptchaVerifier };
