import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Browse from "./pages/Browse";
import Competitions from "./pages/Competitions";
import Sell from "./pages/Sell";

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/competitions" element={<Competitions />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/my-listings" element={<div className="page-content"><h1>My Listings</h1><p>Coming soon...</p></div>} />
            <Route path="/my-purchases" element={<div className="page-content"><h1>My Purchases</h1><p>Coming soon...</p></div>} />
            <Route path="/settings" element={<div className="page-content"><h1>Settings</h1><p>Coming soon...</p></div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;