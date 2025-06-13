import React, { useState } from "react";
import { LogOut, Car, Menu } from "lucide-react";
import { FaInbox } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  let fullName = "";
  let role = "";
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userObj = JSON.parse(userStr);
      fullName = userObj.fullName || "";
      role = userObj.role || "";
    }
  } catch {
    fullName = "";
    role = "";
  }

  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <nav className="w-full bg-white shadow-sm border-b z-20 sticky top-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Logo and App Name */}
        <div className="flex items-center gap-3">
          <Car className="text-blue-600 h-7 w-7" />
          <span className="text-lg font-bold text-gray-900">RideShare</span>
        </div>
        {/* Desktop User Info */}
        <div className="hidden md:flex items-center gap-6">
          <span className="font-medium text-gray-700">
            {fullName && (
              <>
                Welcome, <span className="text-blue-700">{fullName}</span>
                {role && (
                  <span className="ml-2 text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-semibold uppercase">
                    {role}
                  </span>
                )}
              </>
            )}
          </span>
          {/* Logout and Inbox Buttons, Inbox to the left of Logout */}
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold shadow transition"
            style={{ borderRadius: "0.6rem" }}
            onClick={() => navigate("/chat")}
            aria-label="Inbox"
          >
            <FaInbox className="h-5 w-5" />
            Inbox
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow transition"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex items-center justify-center p-2 rounded hover:bg-gray-100 transition"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Open menu"
        >
          <Menu className="h-7 w-7 text-blue-700" />
        </button>
      </div>
      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 pb-4 pt-2 shadow">
          <div className="flex flex-col gap-3">
            <span className="font-medium text-gray-700">
              {fullName && (
                <>
                  Welcome, <span className="text-blue-700">{fullName}</span>
                  {role && (
                    <span className="ml-2 text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-semibold uppercase">
                      {role}
                    </span>
                  )}
                </>
              )}
            </span>
            {/* Inbox and Logout stacked, Inbox above Logout */}
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold shadow transition"
              style={{ borderRadius: "0.6rem" }}
              onClick={() => { setMenuOpen(false); navigate("/chat"); }}
              aria-label="Inbox"
            >
              <FaInbox className="h-5 w-5" />
              Inbox
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow transition w-full justify-center"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;