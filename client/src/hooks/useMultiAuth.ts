import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
  User
} from "firebase/auth";

export function useMultiAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with true for initial load
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google login
  const loginWithGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // User state will be updated by onAuthStateChanged
      setLoading(false);
      return true;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return false;
    }
  };

  // Passwordless email link
  const sendMagicLink = async (email: string) => {
    setLoading(true);
    setError("");
    try {
      await sendSignInLinkToEmail(auth, email, {
        url: window.location.origin + "/login",
        handleCodeInApp: true,
      });
      setEmailSent(true);
      setLoading(false);
      window.localStorage.setItem("emailForSignIn", email);
      return true;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return false;
    }
  };

  // Complete sign-in with email link
  const completeEmailLinkSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem("emailForSignIn") || "";
        if (!email) {
          // Ask user for email if not available
          email = window.prompt("Please provide your email for confirmation") || "";
        }
        const result = await signInWithEmailLink(auth, email, window.location.href);
        // User state will be updated by onAuthStateChanged
        setLoading(false);
        window.localStorage.removeItem("emailForSignIn");
        return true;
      }
      setLoading(false);
      return false;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    await auth.signOut();
    // User state will be updated by onAuthStateChanged
  };

  return {
    user,
    loading,
    error,
    emailSent,
    loginWithGoogle,
    sendMagicLink,
    completeEmailLinkSignIn,
    logout,
  };
}
