import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Phone, Monitor, Tablet } from "lucide-react";

// Mock data for demonstration
const mockUser = {
  name: "Bhupesh Bhaskar",
  email: "bhupesh@example.com",
  image:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  allDevices: [
    {
      deviceId: "1",
      deviceName: "MacBook Pro",
      deviceType: "Desktop",
      lastActive: "2 minutes ago",
    },
    {
      deviceId: "2",
      deviceName: "iPhone 15",
      deviceType: "Mobile",
      lastActive: "1 hour ago",
    },
    {
      deviceId: "3",
      deviceName: "iPad Air",
      deviceType: "Tablet",
      lastActive: "1 day ago",
    },
  ],
};

// Device List Component
const DeviceList = ({ user, handleLogout }) => {
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

  if (!user?.allDevices || user.allDevices.length === 0) {
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
        Connected Devices
      </h3>

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
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
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Last Active
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {user.allDevices.map((device, index) => (
                <tr
                  key={device.deviceId}
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
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                    {device.lastActive || "Unknown"}
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      onClick={() => handleLogout(device.deviceId)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/50 dark:hover:border-red-700"
                    >
                      <LogOut className="w-3 h-3 mr-1.5" />
                      Sign Out
                    </Button>
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

export default DeviceList;
