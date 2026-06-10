import {
  ChevronRight,
  File,
  Folder,
  Home,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { listGoogleDriveItems } from "@/api/integrationApi";

const GOOGLE_FOLDER_MIME = "application/vnd.google-apps.folder";

function GoogleDrive({ selectedIds, onSelectionChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [folderStack, setFolderStack] = useState([
    { id: null, name: "My Drive" },
  ]);

  const currentFolder = folderStack[folderStack.length - 1];

  useEffect(() => {
    loadItems(currentFolder.id);
  }, [currentFolder.id]);

  const loadItems = async (parentId) => {
    setLoading(true);
    try {
      const data = await listGoogleDriveItems(parentId);
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  const openFolder = (item) => {
    setFolderStack((prev) => [...prev, { id: item.id, name: item.name }]);
  };

  const navigateTo = (index) => {
    setFolderStack((prev) => prev.slice(0, index + 1));
    onSelectionChange([]);
  };

  const toggleSelect = (item) => {
    if (item.type === "folder") {
      openFolder(item);
      return;
    }
    const exists = selectedIds.includes(item.id);
    if (exists) {
      onSelectionChange(selectedIds.filter((id) => id !== item.id));
    } else {
      onSelectionChange([...selectedIds, item.id]);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-1 py-2 text-sm text-zinc-500 dark:text-zinc-400 flex-wrap">
        {folderStack.map((folder, index) => (
          <span key={index} className="flex items-center gap-1">
            {index === 0 ? (
              <button
                onClick={() => navigateTo(0)}
                className="flex items-center gap-1 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                <Home size={13} />
                <span>{folder.name}</span>
              </button>
            ) : (
              <button
                onClick={() => navigateTo(index)}
                className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors truncate max-w-[120px]"
              >
                {folder.name}
              </button>
            )}
            {index < folderStack.length - 1 && <ChevronRight size={13} />}
          </span>
        ))}
        <button
          onClick={() => loadItems(currentFolder.id)}
          className="ml-auto p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-400">
            <Loader2 size={28} className="animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-400">
            <Folder size={36} strokeWidth={1.5} />
            <span className="text-sm">This folder is empty</span>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {items.map((item) => {
              const isFolder = item.type === "folder";
              const isSelected = selectedIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item)}
                  className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors group ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-950/40"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  {!isFolder && (
                    <div
                      className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-blue-600 border-blue-600"
                          : "border-zinc-300 dark:border-zinc-600 group-hover:border-zinc-400"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          width="10"
                          height="8"
                          viewBox="0 0 10 8"
                          fill="none"
                        >
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                  )}

                  <div
                    className={`p-1.5 rounded-lg flex-shrink-0 ${
                      isFolder
                        ? "bg-yellow-100 dark:bg-yellow-900/30"
                        : "bg-zinc-100 dark:bg-zinc-700"
                    }`}
                  >
                    {isFolder ? (
                      <Folder
                        size={15}
                        className="text-yellow-600 dark:text-yellow-400"
                        fill="currentColor"
                      />
                    ) : (
                      <File
                        size={15}
                        className="text-zinc-500 dark:text-zinc-400"
                      />
                    )}
                  </div>

                  <span className="flex-1 text-sm text-zinc-800 dark:text-zinc-200 truncate">
                    {item.name}
                  </span>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.size > 0 && (
                      <span className="text-xs text-zinc-400 dark:text-zinc-500">
                        {formatSize(item.size)}
                      </span>
                    )}
                    {isFolder && (
                      <ChevronRight
                        size={14}
                        className="text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default GoogleDrive;
