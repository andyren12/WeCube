import { useState } from "react";
import "./App.css";
import "./styles/Header.css";
import { useAuth } from "./contexts/AuthContext";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import logo from "./assets/wecube-logo.png";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

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
          <div className="navgroup">
            <img src={logo} alt="Logo" />
            <h3>WeCube</h3>
          </div>
          <div className="navgroup" style={{ gap: "2rem" }}>
            <div>Browse</div>
            <div>Competitions</div>
            <div>Sell</div>
          </div>
          <div className="navgroup">
            <button className="icon-buttons">
              <ChatBubbleOutlineIcon fontSize="small" />
            </button>
            <button className="icon-buttons">
              <PersonOutlineIcon />
              {currentUser && currentUser.firstName}
            </button>
          </div>
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
