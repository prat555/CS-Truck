import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const {
    user, loading, error, emailSent,
    loginWithGoogle, sendMagicLink, completeEmailLinkSignIn, logout
  } = useAuth();

  useEffect(() => {
    completeEmailLinkSignIn();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (user) onClose();
    // eslint-disable-next-line
  }, [user]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold mb-2">Sign in to CS-Truck</DialogTitle>
          <DialogDescription className="text-center mb-4">Sign in with Google or get a magic link</DialogDescription>
        </DialogHeader>
        {user ? (
          <div className="p-8 text-center">
            <div className="mb-4">Logged in as <span className="font-semibold">{user.displayName || user.email}</span></div>
            <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={logout}>Logout</button>
          </div>
        ) : (
          <div className="space-y-6 p-6">
            {/* Google Login */}
            <button
              className="w-full bg-white border border-gray-300 text-gray-700 py-2 rounded flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition"
              onClick={loginWithGoogle}
              disabled={loading}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><g><path d="M12 11.5v2.5h6.9c-.3 1.7-2.1 5-6.9 5-4.1 0-7.5-3.4-7.5-7.5s3.4-7.5 7.5-7.5c2.3 0 4.2.8 5.6 2.1l2.3-2.3C18.1 2.7 15.3 1.5 12 1.5 6.2 1.5 1.5 6.2 1.5 12s4.7 10.5 10.5 10.5c6.1 0 10.5-4.4 10.5-10.5 0-.7-.1-1.3-.2-2H12z" fill="#4285F4"/><path d="M12 21c3.1 0 5.7-1 7.6-2.7l-3.6-2.8c-1 .7-2.3 1.1-4 1.1-3.1 0-5.7-2.1-6.6-5.1H1.5v3.2C3.4 18.7 7.3 21 12 21z" fill="#34A853"/><path d="M5.4 14.5c-.2-.6-.4-1.2-.4-2s.2-1.4.4-2V7.3H1.5C.5 9.1 0 10.5 0 12c0 1.5.5 2.9 1.5 4.7l3.9-2.2z" fill="#FBBC05"/><path d="M12 6.5c1.7 0 3.2.6 4.3 1.7l3.2-3.2C17.7 2.7 15.3 1.5 12 1.5c-4.7 0-8.6 2.7-10.5 6.8l3.9 2.2c.9-3 3.5-5 6.6-5z" fill="#EA4335"/></g></svg>
              <span className="font-semibold">{loading ? "Signing in..." : "Sign in with Google"}</span>
            </button>
            
            {/* Divider */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex-1 h-px bg-border" />
              or
              <div className="flex-1 h-px bg-border" />
            </div>
            
            {/* Passwordless Email Link */}
            <form
              className="space-y-2"
              onSubmit={e => {
                e.preventDefault();
                sendMagicLink(email);
              }}
            >
              <input
                type="email"
                placeholder="Email for magic link"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 transition"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </button>
              {emailSent && <div className="text-green-600 text-sm">Magic link sent! Check your email.</div>}
            </form>
            {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
