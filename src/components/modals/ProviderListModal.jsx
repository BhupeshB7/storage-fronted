import { CheckCircle2, ExternalLink, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  connectGoogleDrive,
  getGoogleDriveStatus,
  importGoogleDriveItems,
} from "@/api/integrationApi";
import GoogleDrive from "../providers/GoogleDrive";

const PROVIDERS = [
  {
    id: "google_drive",
    name: "Google Drive",
    icon: (
      <svg
        viewBox="0 0 87.3 78"
        className="w-5 h-5"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
          fill="#0066da"
        />
        <path
          d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z"
          fill="#00ac47"
        />
        <path
          d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z"
          fill="#ea4335"
        />
        <path
          d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z"
          fill="#00832d"
        />
        <path
          d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
          fill="#2684fc"
        />
        <path
          d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"
          fill="#ffba00"
        />
      </svg>
    ),
    available: true,
  },
];

function ProviderListModal({ onClose, onImportSuccess }) {
  const [activeProvider, setActiveProvider] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [connectingId, setConnectingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    checkStatuses();
  }, []);

  const checkStatuses = async () => {
    setCheckingStatus(true);
    const googleStatus = await getGoogleDriveStatus();
    const updated = { google_drive: googleStatus };
    setConnectionStatus(updated);
    setCheckingStatus(false);
    return updated;
  };

  const handleProviderClick = async (provider) => {
    if (!provider.available || connectingId) return;

    if (connectionStatus[provider.id]?.connected) {
      setActiveProvider(provider);
      return;
    }

    setConnectingId(provider.id);
    await connectGoogleDrive();
    const updated = await checkStatuses();
    setConnectingId(null);

    if (updated[provider.id]?.connected) {
      setActiveProvider(provider);
    }
  };

  const handleImport = async () => {
    if (selectedIds.length === 0) return;
    setImporting(true);
    try {
      const result = await importGoogleDriveItems(selectedIds);
      onImportSuccess?.(result.driveDirId);
      onClose();
    } finally {
      setImporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl flex flex-col overflow-hidden"
        style={{ maxHeight: "85vh", minHeight: "520px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {activeProvider ? activeProvider.name : "Import from Cloud"}
          </h2>
          <div className="flex items-center gap-2">
            {activeProvider && (
              <button
                onClick={() => {
                  setActiveProvider(null);
                  setSelectedIds([]);
                }}
                className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                ← Back
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X size={18} className="text-zinc-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {activeProvider ? (
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 px-4 pt-2 pb-4">
              <GoogleDrive
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
              />
            </div>
          ) : (
            <div className="p-6">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
                Connect a cloud storage provider to import your files.
              </p>
              {checkingStatus ? (
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Checking connections...
                </div>
              ) : (
                <div className="space-y-3">
                  {PROVIDERS.map((provider) => {
                    const isConnected =
                      connectionStatus[provider.id]?.connected;
                    const isConnecting = connectingId === provider.id;

                    return (
                      <button
                        key={provider.id}
                        onClick={() => handleProviderClick(provider)}
                        disabled={!provider.available || !!connectingId}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left ${
                          provider.available
                            ? "border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 cursor-pointer"
                            : "border-zinc-100 dark:border-zinc-800 opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg flex-shrink-0">
                          {provider.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                            {provider.name}
                          </p>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                            {isConnecting
                              ? "Waiting for authorization..."
                              : isConnected
                                ? "Connected — click to browse files"
                                : provider.available
                                  ? "Click to connect"
                                  : "Coming soon"}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {isConnecting ? (
                            <Loader2
                              size={18}
                              className="animate-spin text-blue-500"
                            />
                          ) : isConnected ? (
                            <CheckCircle2
                              size={18}
                              className="text-green-500"
                            />
                          ) : provider.available ? (
                            <ExternalLink size={16} className="text-zinc-400" />
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {activeProvider && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {selectedIds.length > 0
                ? `${selectedIds.length} file${selectedIds.length > 1 ? "s" : ""} selected`
                : "Click files to select"}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={selectedIds.length === 0 || importing}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {importing && <Loader2 size={14} className="animate-spin" />}
                {importing ? "Importing..." : "Import"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProviderListModal;
