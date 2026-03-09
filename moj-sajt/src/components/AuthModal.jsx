import { useEffect, useState } from "react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import "./AuthModal.css";

import { auth } from "../firebase";
import { signOut } from "firebase/auth";

function AuthModal({ isOpen, onClose, user }) {

  const [mode, setMode] = useState("login");

  useEffect(() => {
    if (!isOpen) return;

    if (user) {
      setMode("profile");
    } else {
      setMode("login");
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>

      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>

        <button className="auth-close-btn" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="auth-header">
          <h2>
            {mode === "login"
              ? "Prijavi se"
              : mode === "signup"
              ? "Kreiraj nalog"
              : "Profil"}
          </h2>

          <p>
            {mode === "login"
              ? "Prijavi se da bi sačuvao proizvode"
              : mode === "signup"
              ? "Kreiraj nalog da bi sačuvao proizvode"
              : user?.email}
          </p>
        </div>

        {mode === "profile" ? (

          <div style={{ display: "grid", gap: "12px" }}>
            <button className="auth-submit-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>

        ) : mode === "login" ? (

          <LoginForm
            onSwitchToSignup={() => setMode("signup")}
            onClose={onClose}
          />

        ) : (

          <SignupForm
            onSwitchToLogin={() => setMode("login")}
          />

        )}

      </div>
    </div>
  );
}

export default AuthModal;
