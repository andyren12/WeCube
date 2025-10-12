import { useState, useRef, useEffect } from "react";
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
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { currentUser, logout } = useAuth();
  const dropdownRef = useRef(null);

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
    setShowLogoutConfirm(false);
  };

  const toggleDropdown = () => {
    if (currentUser) {
      setShowDropdown(!showDropdown);
    } else {
      setShowLogin(true);
    }
  };

  const handleLogoutClick = () => {
    setShowDropdown(false);
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout();
      setShowLogoutConfirm(false);
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
            <div className="dropdown-container" ref={dropdownRef}>
              <button className="icon-buttons" onClick={toggleDropdown}>
                <PersonOutlineIcon />
                {currentUser && currentUser.firstName}
              </button>
              {showDropdown && currentUser && (
                <div className="dropdown-menu">
                  <div className="dropdown-section">
                    <button className="dropdown-item">Dashboard</button>
                    <button className="dropdown-item">My Listings</button>
                    <button className="dropdown-item">My Purchases</button>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-section">
                    <button className="dropdown-item">Settings</button>
                    <button className="dropdown-item" onClick={handleLogoutClick}>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
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
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content confirmation-modal" onClick={e => e.stopPropagation()}>
            <h2>Confirm Sign Out</h2>
            <p>Are you sure you want to sign out?</p>
            <div className="confirmation-buttons">
              <button className="btn-cancel" onClick={closeModals}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={handleLogoutConfirm}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
