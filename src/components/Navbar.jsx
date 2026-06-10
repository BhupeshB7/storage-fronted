import React, { useState, useRef, useEffect } from "react";
import { 
  User, 
  LogOut,
  Monitor,
  Mail,
  Menu,
  X,
} from "lucide-react";
import useAuthStore from "@/store/authStore";
import ThemeSwitcher from "./ThemeSwitcher";
import { useNavigate } from "react-router-dom";

const Navbar = ({ isMobile, sidebarOpen, toggleSidebar, theme, setTheme }) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout, allLogout } = useAuthStore();

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
  };

  const handleAllDevicesLogout = () => {
    allLogout();
    setIsUserDropdownOpen(false);
  };

  const handleProfile = () => {
    navigate("/profile");
    setIsUserDropdownOpen(false);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsUserDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsUserDropdownOpen(false);
    }, 150);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Sidebar toggle button */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-lg text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {sidebarOpen && isMobile ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        <ThemeSwitcher theme={theme} setTheme={setTheme} />
        {/* User Dropdown */}
        <div
          ref={dropdownRef}
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className={`flex items-center p-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-all ${
              isUserDropdownOpen ? "bg-gray-100 dark:bg-zinc-800" : ""
            }`}
          >
            {user?.picture ? (
              <img
                src={user.picture}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <User className="h-5 w-5" />
            )}
          </button>

          {/* Dropdown menu */}
          <div
            className={`absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 z-50 transform transition-all duration-200 origin-top-right ${
              isUserDropdownOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
            }`}
          >
            <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Signed in
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleProfile}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <User className="h-4 w-4 mr-3" />
              Profile
            </button>

            <div className="my-1 border-t border-gray-200 dark:border-zinc-700"></div>

            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Logout
            </button>

            <button
              onClick={handleAllDevicesLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <Monitor className="h-4 w-4 mr-3" />
              All Devices Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
