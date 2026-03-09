import { auth } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useState } from "react";

import "./AuthForms.css";

function SignupForm({ onSwitchToLogin }) {

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (password !== confirmPassword) {
      alert("Lozinke se ne poklapaju!");
      return;
    }

    try {

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(userCredential.user, {
        displayName: name
      });

      alert("Nalog uspešno kreiran!");

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>

      <div className="form-group">
        <label htmlFor="signup-name">Ime i prezime</label>
        <input
          type="text"
          id="signup-name"
          name="name"
          placeholder="Unesite ime i prezime"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="signup-email">Email</label>
        <input
          type="email"
          id="signup-email"
          name="email"
          placeholder="Unesite email"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="signup-password">Lozinka</label>

        <div style={{ display: "flex", gap: "8px" }}>

          <input
            style={{ flex: 1 }}
            type={showPassword ? "text" : "password"}
            id="signup-password"
            name="password"
            placeholder="Unesite lozinku"
            required
            minLength="6"
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

      <div className="form-group">
  <label htmlFor="signup-confirm-password">Potvrdi lozinku</label>

  <div style={{ display: "flex", gap: "8px" }}>
    <input
      style={{ flex: 1 }}
      type={showPassword ? "text" : "password"}
      id="signup-confirm-password"
      name="confirmPassword"
      placeholder="Potvrdite lozinku"
      required
      minLength="6"
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
        Kreiraj nalog
      </button>

      <p className="auth-switch">
        Već imaš nalog?{" "}
        <button type="button" onClick={onSwitchToLogin}>
          Prijavi se
        </button>
      </p>

    </form>
  );
}

export default SignupForm;
