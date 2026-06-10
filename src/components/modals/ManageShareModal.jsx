import {
  getFileShareList,
  removeFileShare,
  updateSharePermission,
} from "@/api/fileDirectoryApi";
import { Trash2, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

function ManageShareModal({ file, onClose }) {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShares();
  }, []);

  const fetchShares = async () => {
    setLoading(true);
    try {
      const data = await getFileShareList(file._id || file.id);
      setShares(data || []);
    } catch (error) {
      setShares([]);
    }
    setLoading(false);
  };

  const handlePermissionChange = async (shareId, newPermission) => {
    const success = await updateSharePermission(shareId, {
      permission: newPermission,
    });
    if (success) {
      fetchShares();
    }
  };

  const handleRemoveAccess = async (shareId) => {
    const success = await removeFileShare(shareId);
    if (success) {
      fetchShares();
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
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-xl transition-all duration-300 max-h-[80vh] overflow-y-auto"
        onClick={handleContentClick}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Manage Access
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

        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-zinc-500 dark:text-zinc-400 mt-4 text-sm">
              Loading...
            </p>
          </div>
        ) : shares.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-600 dark:text-zinc-400 font-medium">
              No shared access
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">
              This file hasn't been shared with anyone yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {shares.map((share) => {
              const userEmail = share.sharedWithEmail || "Unknown User";
              const userName = share.sharedWithName || userEmail;
              const shareDate = share.sharedAt
                ? new Date(share.sharedAt).toLocaleDateString()
                : "Unknown";
              const shareId = share.id || share._id;

              return (
                <div
                  key={shareId}
                  className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                          {userName}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {userEmail} • Shared {shareDate}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <select
                      value={share.permission}
                      onChange={(e) =>
                        handlePermissionChange(shareId, e.target.value)
                      }
                      className="px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="VIEW">View</option>
                      <option value="EDIT">Edit</option>
                    </select>

                    <button
                      onClick={() => handleRemoveAccess(shareId)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Remove access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-zinc-200 dark:border-zinc-700 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg shadow-sm transition-all duration-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageShareModal;
