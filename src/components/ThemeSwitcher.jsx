import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";

const ThemeSwitcher = ({ theme, setTheme }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const themes = [
    { name: "Light", value: "light", icon: Sun },
    { name: "Dark", value: "dark", icon: Moon },
    { name: "System", value: "system", icon: Monitor },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full px-4 py-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md group"
        >
          <span className="flex items-center gap-3">
            <div className="p-1 bg-white/20 dark:bg-zinc-700 rounded-lg">
              {theme === "light" && <Sun size={16} />}
              {theme === "dark" && <Moon size={16} />}
              {theme === "system" && <Monitor size={16} />}
            </div>
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </span>
          <ChevronDown
            size={16}
            className={`ml-2 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {open && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-700 py-2 z-10 animate-in slide-in-from-top-2 duration-200">
            {themes.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:text-blue-900 dark:hover:text-blue-200 dark:text-zinc-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors ${
                  theme === option.value
                    ? "bg-gray-100 dark:bg-zinc-700 font-medium"
                    : ""
                }`}
              >
                <div className="p-1.5 bg-gray-100 dark:bg-zinc-600 rounded-lg">
                  <option.icon size={14} />
                </div>
                {option.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
