import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult, User } from "firebase/auth";

export function usePhoneAuth() {
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Send OTP
  const sendOtp = async (phone: string, recaptchaContainerId: string) => {
    setLoading(true);
    setError("");
    try {
      if (typeof window === "undefined") throw new Error("Recaptcha can only be initialized in the browser");
      // Ensure recaptcha container exists
      let recaptchaDiv = document.getElementById(recaptchaContainerId);
      if (!recaptchaDiv) {
        recaptchaDiv = document.createElement("div");
        recaptchaDiv.id = recaptchaContainerId;
        document.body.appendChild(recaptchaDiv);
      }
      // For local/dev testing, disable app verification
      if (process.env.NODE_ENV === "development") {
        // @ts-ignore
        auth.settings.appVerificationDisabledForTesting = true;
      }
  // Use the correct RecaptchaVerifier constructor for Firebase v9+ modular SDK
  const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, { size: "invisible" });
      await verifier.render();
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmationResult(result);
      setLoading(false);
      return true;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return false;
    }
  };

  // Step 2: Verify OTP
  const verifyOtp = async (otp: string) => {
    setLoading(true);
    setError("");
    try {
      if (!confirmationResult) throw new Error("No OTP sent");
      const result = await confirmationResult.confirm(otp);
      setUser(result.user);
      setLoading(false);
      return true;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return false;
    }
  };

  // Step 3: Logout
  const logout = async () => {
    await auth.signOut();
    setUser(null);
  };

  return { user, loading, error, sendOtp, verifyOtp, logout };
}
