import { getAllUsers, shareFile } from "@/api/fileDirectoryApi";
import Fuse from "fuse.js";
import { Shield, User, UserPlus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

function ShareModal({ file, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("VIEW");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    const allUsers = await getAllUsers();
    setUsers(allUsers);
  };

  const fuse = useMemo(() => {
    return new Fuse(users, {
      keys: ["email", "name"],
      threshold: 0.3,
    });
  }, [users]);

  useEffect(() => {
    if (email.trim() === "") {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const fuseResults = fuse.search(email).map((result) => result.item);
    setSearchResults(fuseResults);
    setShowDropdown(true);
  }, [email, fuse]);

  const handleUserSelect = (user) => {
    setEmail(user.email);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !email.trim()) {
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return;
    }

    setLoading(true);
    const success = await shareFile(file._id, { email, permission });
    setLoading(false);

    if (success) {
      setEmail("");
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  const handleOverlayClick = () => {
    onClose();
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-xl transition-all duration-300"
        onClick={handleContentClick}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Share File
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate max-w-xs">
                {file.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              User Email
            </label>
            <input
              ref={inputRef}
              id="email"
              type="email"
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white"
              placeholder="Search by email or name..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => email.trim() && setShowDropdown(true)}
              required
            />
            {showDropdown && searchResults.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleUserSelect(user)}
                    className="px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer transition-colors border-b border-zinc-100 dark:border-zinc-700 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                          {user.name || "Unknown User"}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              <Shield className="w-4 h-4 inline mr-1" />
              Permission
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPermission("VIEW")}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  permission === "VIEW"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                <div className="font-semibold">View Only</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Can view and download
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPermission("EDIT")}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  permission === "EDIT"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                }`}
              >
                <div className="font-semibold">Can Edit</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Can modify and delete
                </div>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200 rounded-lg"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Sharing..." : "Share"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ShareModal;
