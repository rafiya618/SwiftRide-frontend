import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BookingPage from "./pages/BookingPage";
import Inbox from "./pages/Inbox";
import DriverApp from "./pages/driverPage";
import RideHistory from "./pages/RideHistory";
import Navbar from "./components/Navbar"; // Make sure this is a default import

// If you see "object" instead of a component, it means you are doing a named import or export incorrectly.
// Double-check that Navbar is exported as default in components/Navbar.jsx and imported as default here.

function AppRoutes({ user, setUser }) {
  const location = useLocation();
  const hideNavbarRoutes = ["/", "/login", "/signup"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage user={user} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup setUser={setUser} />} />
        <Route
          path="/booking"
          element={user && user.role === "passenger" ? <BookingPage user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/driver"
          element={user && user.role === "driver" ? <DriverApp user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/chat"
          element={user ? <Inbox user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/ride-history"
          element={user ? <RideHistory /> : <Navigate to="/login" />}
        />
      </Routes>
    </>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  return (
    <Router>
      <AppRoutes user={user} setUser={setUser} />
    </Router>
  );
}

export default App;
