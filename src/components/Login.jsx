import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import "../styles/Auth.css";

export function Login({ onClose, switchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await login(email, password);
      onClose();
    } catch (error) {
      setError("Failed to log in: " + error.message);
    }

    setLoading(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Log In</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {password.length > 0 &&
                  (showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />)}
              </button>
            </div>
          </div>
          <button disabled={loading} type="submit">
            Log In
          </button>
        </form>
        <p>
          Need an account?{" "}
          <button type="button" onClick={switchToRegister}>
            Sign Up
          </button>
        </p>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
}
