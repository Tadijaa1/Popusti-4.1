import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";

import "./AuthForms.css";

function LoginForm({ onSwitchToSignup, onClose }) {

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Ulogovan!");
      if (onClose) onClose();
    } catch (error) {
  let msg = "Neuspešna prijava. Pokušaj ponovo.";

  if (error.code === "auth/invalid-credential") {
    msg = "Email ili lozinka nisu tačni.";
  } else if (error.code === "auth/user-not-found") {
    msg = "Ne postoji nalog sa tim emailom.";
  } else if (error.code === "auth/wrong-password") {
    msg = "Pogrešna lozinka.";
  } else if (error.code === "auth/invalid-email") {
    msg = "Email nije ispravan.";
  } else if (error.code === "auth/too-many-requests") {
    msg = "Previše pokušaja. Sačekaj malo pa probaj opet.";
  }

  alert(msg);
}
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>

      <div className="form-group">
        <label htmlFor="login-email">Email</label>
        <input
          type="email"
          id="login-email"
          name="email"
          placeholder="Unesite email"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="login-password">Lozinka</label>

        <div style={{ display: "flex", gap: "8px" }}>
          <input
            style={{ flex: 1 }}
            type={showPassword ? "text" : "password"}
            id="login-password"
            name="password"
            placeholder="Unesite lozinku"
            required
          />

          <button
            type="button"
            className="auth-submit-btn"
            style={{ width: "110px" }}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Sakrij" : "Prikaži"}
          </button>

        </div>
      </div>

      <button type="submit" className="auth-submit-btn">
        Prijavi se
      </button>

      <p className="auth-switch">
        Nemaš nalog?{" "}
        <button type="button" onClick={onSwitchToSignup}>
          Registruj se
        </button>
      </p>

    </form>
  );
}

export default LoginForm;