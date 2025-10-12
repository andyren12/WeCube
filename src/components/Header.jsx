import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Login } from "./Login";
import { Register } from "./Register";
import logo from "../assets/wecube-logo.png";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import "../styles/Header.css";
import "../styles/Auth.css";

function Header() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { currentUser, logout } = useAuth();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
      navigate('/');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleDropdownNavigation = (path) => {
    setShowDropdown(false);
    navigate(path);
  };

  // Close dropdown when clicking outside
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
            <Link to="/">
              <img src={logo} alt="Logo" />
            </Link>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h3>WeCube</h3>
            </Link>
          </div>
          <div className="navgroup" style={{ gap: "2rem" }}>
            <Link to="/browse" className="nav-link">Browse</Link>
            <Link to="/competitions" className="nav-link">Competitions</Link>
            <Link to="/sell" className="nav-link">Sell</Link>
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
                    <button className="dropdown-item" onClick={() => handleDropdownNavigation('/dashboard')}>
                      Dashboard
                    </button>
                    <button className="dropdown-item" onClick={() => handleDropdownNavigation('/my-listings')}>
                      My Listings
                    </button>
                    <button className="dropdown-item" onClick={() => handleDropdownNavigation('/my-purchases')}>
                      My Purchases
                    </button>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-section">
                    <button className="dropdown-item" onClick={() => handleDropdownNavigation('/settings')}>
                      Settings
                    </button>
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

      {showLogin && (
        <Login onClose={closeModals} switchToRegister={switchToRegister} />
      )}
      {showRegister && (
        <Register onClose={closeModals} switchToLogin={switchToLogin} />
      )}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
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

export default Header;