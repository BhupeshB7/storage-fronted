import { api } from "./fileDirectoryApi";
import { toast } from "sonner";

export const connectGoogleDrive = () => {
  return new Promise((resolve) => {
    const popup = window.open(
      "http://localhost:3000/api/integrations/google/connect",
      "google_drive_connect",
      "width=500,height=600,scrollbars=yes,resizable=yes",
    );

    const timer = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(timer);
        resolve();
      }
    }, 500);
  });
};

export const disconnectGoogleDrive = async () => {
  try {
    const res = await api.delete("/integrations/google/disconnect");
    return res.data;
  } catch (err) {
    toast.error(
      err.response?.data?.error || "Failed to disconnect Google Drive",
    );
    throw err;
  }
};

export const getGoogleDriveStatus = async () => {
  try {
    const res = await api.get("/integrations/google/status");
    return res.data;
  } catch {
    return { connected: false };
  }
};

export const listGoogleDriveItems = async (parentId = null) => {
  try {
    const params = parentId ? `?parentId=${parentId}` : "";
    const res = await api.get(`/integrations/google/list${params}`);
    return res.data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to list Drive items");
    throw err;
  }
};

export const importGoogleDriveItems = async (driveItemIds) => {
  try {
    const res = await api.post("/integrations/google/import", { driveItemIds });
    return res.data;
  } catch (err) {
    toast.error(err.response?.data?.error || "Failed to import files");
    throw err;
  }
};
