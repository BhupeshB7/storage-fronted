import { getUserStorage } from "@/api/fileDirectoryApi";
import { directoryStore } from "@/store/directoryStore";
import {
  ChevronDown,
  Clock,
  Cloud,
  FolderPlus,
  HardDrive,
  Import,
  Settings,
  Share2,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import FileUpload from "./FileUpload";
import ProviderListModal from "./modals/ProviderListModal";
const Sidebar = ({ isOpen, onClose, isMobile }) => {
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [storageData, setStorageData] = useState({
    used: 0,
    limit: 1073741824,
    usedPercentage: "0",
  });
  const openCreateFolderModal = directoryStore(
    (state) => state.openCreateFolderModal,
  );
  const loadDirectory = directoryStore((state) => state.loadDirectory);
  const refetch = directoryStore.getInitialState().refetch;
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStorageData();
  }, []);

  const fetchStorageData = async () => {
    const data = await getUserStorage();
    setStorageData(data);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUploadModalOpen) return;
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNewMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isUploadModalOpen]);

  const handleImportSuccess = (driveDirId) => {
    if (driveDirId) {
      loadDirectory(driveDirId);
      navigate(`/directory/${driveDirId}`);
    } else {
      refetch();
    }
    fetchStorageData();
  };

  const navigationItems = [
    {
      name: "My Drive",
      path: "/",
      icon: HardDrive,
      color: "text-gray-600 dark:text-zinc-400",
      bgIcon: "bg-gray-100 dark:bg-zinc-700",
    },
    {
      name: "Recent",
      path: "/recent",
      icon: Clock,
      color: "text-gray-600 dark:text-zinc-400",
      bgIcon: "bg-gray-100 dark:bg-zinc-700",
    },
    {
      name: "Starred",
      path: "/starred",
      icon: Star,
      color: "text-yellow-500 dark:text-yellow-100",
      bgIcon: "bg-yellow-100 dark:bg-yellow-700",
    },
    {
      name: "Shared with me",
      path: "/shared",
      icon: Share2,
      color: "text-green-500 dark:text-green-100",
      bgIcon: "bg-green-100 dark:bg-green-700",
    },
    {
      name: "Trash",
      path: "/trash",
      icon: Trash2,
      color: "text-red-500 dark:text-red-100",
      bgIcon: "bg-red-100 dark:bg-red-700",
    },
  ];

  const bottomItems = [{ name: "Settings", path: "/settings", icon: Settings }];

  const storageUsedGB = (storageData.used / (1024 * 1024 * 1024)).toFixed(2);
  const totalStorageGB = (storageData.limit / (1024 * 1024 * 1024)).toFixed(2);
  const storagePercentage = parseFloat(storageData.usedPercentage);

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${!isMobile ? "md:translate-x-0" : ""}`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setNewMenuOpen(!newMenuOpen)}
              className="flex items-center justify-between w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl group"
            >
              <span className="flex items-center gap-3">
                <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <FolderPlus size={16} />
                </div>
                New
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  newMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {newMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-800 rounded-xl shadow-2xl border border-gray-200 dark:border-zinc-700 py-2 z-10 animate-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    openCreateFolderModal();
                    setNewMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  <div className="p-1.5 bg-gray-100 dark:bg-zinc-600 rounded-lg">
                    <FolderPlus size={14} />
                  </div>
                  New Folder
                </button>

                <button
                  onClick={() => {
                    setIsProviderModalOpen(true);
                    setNewMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  <div className="p-1.5 bg-gray-100 dark:bg-zinc-600 rounded-lg">
                    <Import size={14} />
                  </div>
                  Import
                </button>

                <hr className="my-2 border-gray-200 dark:border-zinc-700" />
                <div className="px-4 py-1">
                  <FileUpload
                    parentDirId={null}
                    onUploadSuccess={refetch}
                    onModalStateChange={setIsUploadModalOpen}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/"}
              onClick={isMobile ? onClose : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 shadow-sm"
                    : "text-gray-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1.5 rounded-lg ${
                      isActive
                        ? "bg-blue-100 dark:bg-blue-900/50"
                        : `${item.bgIcon} group-hover:bg-gray-200 dark:group-hover:bg-zinc-600`
                    } transition-colors`}
                  >
                    <item.icon
                      size={16}
                      className={
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : item.color
                      }
                    />
                  </div>
                  <span className="truncate">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-gray-200 dark:border-zinc-800">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Cloud size={16} className="text-gray-500 dark:text-zinc-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                Storage
              </span>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 dark:text-zinc-400">
                  {storageUsedGB} GB used
                </span>
                <span className="text-gray-500 dark:text-zinc-500">
                  {totalStorageGB} GB
                </span>
              </div>
            </div>
          </div>

          <div className="px-2 pb-4 space-y-1">
            {bottomItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={isMobile ? onClose : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`p-1.5 rounded-lg ${
                        isActive
                          ? "bg-blue-100 dark:bg-blue-900/50"
                          : "bg-gray-100 dark:bg-zinc-700 group-hover:bg-gray-200 dark:group-hover:bg-zinc-600"
                      } transition-colors`}
                    >
                      <item.icon
                        size={16}
                        className={
                          isActive
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-600 dark:text-zinc-400"
                        }
                      />
                    </div>
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </aside>

      {isProviderModalOpen && (
        <ProviderListModal
          onClose={() => setIsProviderModalOpen(false)}
          onImportSuccess={handleImportSuccess}
        />
      )}
    </>
  );
};

export default Sidebar;
