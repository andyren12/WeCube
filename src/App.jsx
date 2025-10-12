import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import "./App.css";
import theme from "./theme";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Header";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Browse from "./pages/Browse";
import Competitions from "./pages/Competitions";
import Sell from "./pages/Sell";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh",
            }}
          >
            <Header />
            <Box component="main" sx={{ flexGrow: 1, pt: 8 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/competitions" element={<Competitions />} />
                <Route path="/sell" element={<Sell />} />
                <Route
                  path="/my-listings"
                  element={
                    <Box sx={{ p: 3 }}>
                      <h1>My Listings</h1>
                      <p>Coming soon...</p>
                    </Box>
                  }
                />
                <Route
                  path="/my-purchases"
                  element={
                    <Box sx={{ p: 3 }}>
                      <h1>My Purchases</h1>
                      <p>Coming soon...</p>
                    </Box>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <Box sx={{ p: 3 }}>
                      <h1>Settings</h1>
                      <p>Coming soon...</p>
                    </Box>
                  }
                />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
