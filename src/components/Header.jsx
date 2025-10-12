import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Box,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { Login } from "./Login";
import { Register } from "./Register";
import logo from "../assets/wecube-logo.png";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

function Header() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const isMenuOpen = Boolean(anchorEl);

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

  const handleMenuOpen = (event) => {
    if (currentUser) {
      setAnchorEl(event.currentTarget);
    } else {
      setShowLogin(true);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    setAnchorEl(null);
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await logout();
      setShowLogoutConfirm(false);
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleMenuNavigation = (path) => {
    setAnchorEl(null);
    navigate(path);
  };
  return (
    <>
      <AppBar position="fixed" color="inherit" elevation={1}>
        <Toolbar sx={{ px: { xs: 2, md: 10 } }}>
          <Box
            component={Link}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <img
              src={logo}
              alt="WeCube Logo"
              style={{ height: 40, marginRight: 12 }}
            />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              WeCube
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3, mr: 3 }}>
            <Button component={Link} to="/browse" color="inherit">
              Browse
            </Button>
            <Button component={Link} to="/competitions" color="inherit">
              Competitions
            </Button>
            <Button component={Link} to="/sell" color="inherit">
              Sell
            </Button>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton color="inherit">
              <ChatBubbleOutlineIcon fontSize="small" />
            </IconButton>

            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderRadius: 2,
                px: 1,
              }}
            >
              <PersonOutlineIcon />
              {currentUser && (
                <Typography
                  variant="body2"
                  sx={{ display: { xs: "none", sm: "block" } }}
                >
                  {currentUser.firstName}
                </Typography>
              )}
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={isMenuOpen}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                sx: { mt: 1, minWidth: 180 },
              }}
            >
              <MenuItem onClick={() => handleMenuNavigation("/dashboard")}>
                Dashboard
              </MenuItem>
              <MenuItem onClick={() => handleMenuNavigation("/my-listings")}>
                My Listings
              </MenuItem>
              <MenuItem onClick={() => handleMenuNavigation("/my-purchases")}>
                My Purchases
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => handleMenuNavigation("/settings")}>
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogoutClick}>Sign Out</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {showLogin && (
        <Login onClose={closeModals} switchToRegister={switchToRegister} />
      )}
      {showRegister && (
        <Register onClose={closeModals} switchToLogin={switchToLogin} />
      )}

      <Dialog
        open={showLogoutConfirm}
        onClose={closeModals}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Sign Out</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to sign out?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModals} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            color="error"
            variant="contained"
          >
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Header;
