import { useState } from "react";
import "./App.css";
import "./styles/Header.css";
import { useAuth } from "./contexts/AuthContext";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import logo from "./assets/wecube-logo.png";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { currentUser } = useAuth();

  const switchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const switchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const closeModals = () => {
    setShowLogin(false);
    setShowRegister(false);
  };

  return (
    <>
      <div className="header">
        <div className="navbar">
          <img src={logo} alt="Logo" />
          <button className="account-btn">
            <PersonOutlineIcon />
            {currentUser && currentUser.firstName}
          </button>
        </div>
      </div>
      <h1>WeCube</h1>
      {showLogin && (
        <Login onClose={closeModals} switchToRegister={switchToRegister} />
      )}
      {showRegister && (
        <Register onClose={closeModals} switchToLogin={switchToLogin} />
      )}
    </>
  );
}

export default App;
