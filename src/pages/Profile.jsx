import {
  getUserProfile,
  getUserStorage,
  logoutAllDevices,
} from "@/api/fileDirectoryApi";
import SharedLoader from "@/components/shared/SharedLoader";
import useAuthStore from "@/store/authStore";
import {
  HardDrive,
  LogOut,
  Monitor,
  Phone,
  Settings,
  Tablet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-zinc-900 text-white hover:bg-zinc-800 focus:ring-zinc-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
    outline:
      "border border-zinc-300 text-zinc-700 bg-white hover:bg-zinc-50 focus:ring-zinc-500 dark:border-zinc-600 dark:text-zinc-300 dark:bg-zinc-900 dark:hover:bg-zinc-800",
    ghost:
      "text-zinc-700 hover:bg-zinc-100 focus:ring-zinc-500 dark:text-zinc-300 dark:hover:bg-zinc-800",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-xl",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ className = "", ...props }) => {
  return (
    <input
      className={`w-full px-3 py-2 border border-zinc-300 rounded-lg bg-white text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400 dark:focus:ring-zinc-400 ${className}`}
      {...props}
    />
  );
};

const Label = ({ children, className = "", ...props }) => {
  return (
    <label
      className={`block text-sm font-medium text-zinc-700 dark:text-zinc-300 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};

const Avatar = ({ src, alt, fallback, className = "" }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`relative overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 ${className}`}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 font-semibold">
          {fallback}
        </div>
      )}
    </div>
  );
};

const DeviceList = ({ devices }) => {
  const getDeviceIcon = (type) => {
    if (!type) return <Monitor className="w-4 h-4" />;
    const t = type.toLowerCase();
    if (t.includes("mobile") || t.includes("android") || t.includes("iphone"))
      return <Phone className="w-4 h-4" />;
    if (t.includes("tablet") || t.includes("ipad"))
      return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const getDeviceIconColor = (type) => {
    if (!type)
      return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
    const t = type.toLowerCase();
    if (t.includes("mobile") || t.includes("android") || t.includes("iphone"))
      return "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400";
    if (t.includes("tablet") || t.includes("ipad"))
      return "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400";
    return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  };

  if (!devices || devices.length === 0) {
    return (
      <div className="pt-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Connected Devices
        </h3>
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          No devices found
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 space-y-4">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
        <Monitor className="w-5 h-5" />
        Connected Devices ({devices.length})
      </h3>

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Device
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {devices.map((device, index) => (
                <tr
                  key={device.deviceId || index}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <div
                      className={`w-10 h-10 rounded-lg ${getDeviceIconColor(device.deviceType)} flex items-center justify-center`}
                    >
                      {getDeviceIcon(device.deviceType)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      {device.deviceName || "Unknown Device"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                      {device.deviceType}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StorageSection = ({ storageData }) => {
  const formatBytes = (bytes) => {
    if (!bytes) return "0 GB";
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(2) + " GB";
  };

  const usedPercentage = parseFloat(storageData?.usedPercentage || "0");

  return (
    <div className="pt-6 space-y-4">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
        <HardDrive className="w-5 h-5" />
        Storage Usage
      </h3>

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Used Storage
            </span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {formatBytes(storageData?.used)} /{" "}
              {formatBytes(storageData?.limit)}
            </span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(usedPercentage, 100)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Used</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {formatBytes(storageData?.used)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Remaining
              </p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {formatBytes(storageData?.remaining)}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Storage Used
              </span>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {usedPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [storageData, setStorageData] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [profile, storage] = await Promise.all([
        getUserProfile(),
        getUserStorage(),
      ]);
      setProfileData(profile);
      setStorageData(storage);
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (
      !window.confirm(
        "Are you sure you want to logout from all devices? You will be logged out immediately.",
      )
    ) {
      return;
    }

    setIsLoggingOut(true);
    try {
      await logoutAllDevices();
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to logout from all devices:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <SharedLoader fullScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Account Settings
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Manage your account and preferences
          </p>
        </div>

        <div className="border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-2xl bg-white dark:bg-zinc-900">
          <div className="p-8 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar
                src={profileData?.picture}
                alt={profileData?.name}
                fallback={getUserInitials(profileData?.name)}
                className="w-24 h-24 border-4 border-white dark:border-zinc-800 shadow-xl ring-4 ring-zinc-100 dark:ring-zinc-800"
              />

              <div className="flex-1 text-center sm:text-left space-y-2">
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {profileData?.name || "User"}
                </h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400">
                  {profileData?.email || "No email"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Account Information
              </h3>

              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData?.name || ""}
                    readOnly
                    className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={profileData?.email || ""}
                    readOnly
                    className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <StorageSection storageData={storageData} />

            <DeviceList devices={profileData?.allDevices} />

            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-700">
              <Button
                onClick={handleLogoutAllDevices}
                variant="destructive"
                size="lg"
                disabled={isLoggingOut}
                className="w-full sm:w-auto transform hover:scale-105 shadow-lg"
              >
                <LogOut className="mr-2 w-4 h-4" />
                {isLoggingOut ? "Logging out..." : "Logout All Devices"}
              </Button>
            </div>
          </div>
        </div>

        <footer className="text-center space-y-3 text-zinc-500 dark:text-zinc-400 pb-8">
          <p className="text-sm">Secure cloud storage</p>
        </footer>
      </div>
    </div>
  );
};

export default Profile;
