import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import ConfirmDialog from "./ConfirmDialog";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowMenu(false);
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white dark:bg-secondary shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Home link */}
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-bold text-primary hover:text-primary-dark transition-colors"
          >
            POWR
          </button>

          {/* User section */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-primary transition-colors"
            >
              {/* User avatar */}
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-medium">{user?.name}</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  showMenu ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={() => {
                    navigate("/settings");
                    setShowMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(true);
                    setShowMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </header>
  );
};

export default Header;
