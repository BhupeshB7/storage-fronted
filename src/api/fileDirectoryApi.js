import axios from "axios";
import { toast } from "sonner";

// Create axios instance with interceptor for rate limiting
export const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// Response interceptor to handle rate limit errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response?.status === 429) {
      toast.error(
        response.data.error || "Too many requests, please try again later",
      );
      return Promise.reject(error);
    }

    if (response?.status === 401) {
      toast.error("Session expired, please login again");
      if (window.location.pathname !== "/login") {
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }
    }

    return Promise.reject(error);
  },
);
export const fetchSearchResults = async () => {
  const response = await api.get("/search", {
    withCredentials: true,
  });
  return response.data.combines;
};

export const fetchDirectory = async (parentId, options = {}) => {
  try {
    const { page = 1, limit = 30, sortBy, filterBy } = options;
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);
    if (sortBy) params.append("sortBy", sortBy);
    if (filterBy) params.append("filterBy", filterBy);

    const queryString = params.toString();
    const res = await api.get(
      `/directory/${parentId || ""}${queryString ? `?${queryString}` : ""}`,
    );
    return res.data;
  } catch (err) {
    console.log("Error fetching directory:", err);
    toast.error(err.response?.data?.error || "Failed to load directory");
    throw err;
  }
};

export const getBreadcrumbPath = async (dirId) => {
  try {
    const res = await api.get(`/directory/breadcrumb/${dirId}`);
    return res.data.path || [];
  } catch (err) {
    toast.error("Failed to load breadcrumb");
    return [];
  }
};

export const handleCreateDirectory = async (parentId, dirname, refetch) => {
  if (!dirname || !dirname.trim()) {
    toast.error("Folder name is required");
    return false;
  }

  try {
    const res = await api.post(`/directory/create/${parentId || ""}`, null, {
      headers: { dirname },
    });
    if (res.status === 201) {
      toast.success("Folder created successfully");
      if (refetch) refetch();
      return true;
    }
  } catch (err) {
    toast.error(
      err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to create folder",
    );
    return false;
  }
};

export const handleRenameDirOrFile = async (type, id, value, refetch) => {
  if (!value || !value.trim()) {
    toast.error(`Please enter a valid ${type} name`);
    return false;
  }
  try {
    const url =
      type === "file" ? `/files/rename/${id}` : `/directory/rename/${id}`;
    const data =
      type === "file" ? { newFileName: value } : { newDirName: value };

    const res = await api.patch(url, data);
    if (res.status === 200) {
      toast.success(`${type} renamed successfully`);
      if (refetch) refetch();
      return true;
    }
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to rename",
    );
    return false;
  }
};

export const handleDeleteDir = async (id, refetch) => {
  try {
    const res = await api.delete(`/directory/${id}`);
    if (res.status === 200) {
      toast.success("Folder deleted successfully");
      if (refetch) refetch();
      return true;
    }
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to delete folder",
    );
    return false;
  }
};

export const deleteFile = async (fileId, refetch) => {
  try {
    const res = await api.delete(`/files/${fileId}`);
    if (res.status === 200) {
      if (refetch) refetch();
      toast.success("File deleted successfully");
      return true;
    }
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to delete",
    );
    return false;
  }
};

export const deleteBulkFiles = async (fileIds, refetch) => {
  try {
    const res = await api.delete(`/files/bulk-delete`, {
      data: { fileIds },
    });
    if (res.status === 200) {
      if (refetch) refetch();
      toast.success(res.data.message || "Files deleted successfully");
      return true;
    }
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to star file",
    );
    return false;
  }
};

export const handleStarred = async (fileId, refetch) => {
  try {
    const res = await api.patch(`/files/starred/${fileId}`, null);
    if (res.status === 200) {
      toast.success(res.data.message);
      if (refetch) refetch();
      return true;
    }
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to star file",
    );
    return false;
  }
};

export const allTrashFiles = async (
  page = 1,
  limit = 30,
  sortBy = "recent",
  filterBy,
) => {
  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);
    params.append("sortBy", sortBy);
    if (filterBy) params.append("filterBy", filterBy);

    const res = await api.get(`/trash?${params.toString()}`);
    return res.data;
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to load trash",
    );
    throw error;
  }
};

export const restoreTrashFile = async (fileId, refetch) => {
  try {
    const res = await api.post(`/trash/${fileId}/restore`);
    if (res.status === 200) {
      toast.success("File restored successfully");
      if (refetch) refetch();
      return true;
    }
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to restore file",
    );
    return false;
  }
};

export const shareFile = async (fileId, payload) => {
  try {
    const res = await api.post(`/share/${fileId}`, payload);
    if (res.status === 200 || res.status === 201) {
      toast.success("File shared successfully");
      return true;
    }
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to share file",
    );
    return false;
  }
};

export const getSharedFiles = async (
  page = 1,
  limit = 30,
  sortBy,
  filterBy,
) => {
  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);
    if (sortBy) params.append("sortBy", sortBy);
    if (filterBy) params.append("filterBy", filterBy);

    const res = await api.get(`/share?${params.toString()}`);
    return res.data.files || [];
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to load shared files",
    );
    throw error;
  }
};

export const getFileShareList = async (fileId) => {
  try {
    const res = await api.get(`/share/${fileId}/list`);
    return res.data.shares || [];
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to load share list",
    );
    throw error;
  }
};

export const updateSharePermission = async (shareId, payload) => {
  try {
    const res = await api.patch(`/share/${shareId}/permission`, payload);
    if (res.status === 200) {
      toast.success("Permission updated successfully");
      return true;
    }
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to update permission",
    );
    return false;
  }
};

export const removeFileShare = async (shareId) => {
  try {
    const res = await api.delete(`/share/${shareId}`);
    if (res.status === 200) {
      toast.success("Access removed successfully");
      return true;
    }
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to remove access",
    );
    return false;
  }
};

export const getAllUsers = async () => {
  try {
    const res = await api.get("/user/all");
    return res.data.users || [];
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to load users",
    );
    return [];
  }
};

export const getUserStorage = async () => {
  try {
    const res = await api.get("/user/storage");
    return res.data.data;
  } catch (error) {
    console.error("Error fetching storage:", error);
    return {
      used: 0,
      limit: 1073741824,
      remaining: 1073741824,
      usedPercentage: "0",
    };
  }
};

export const getUserProfile = async () => {
  try {
    const res = await api.get("/user/profile");
    return res.data.user;
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to load profile",
    );
    throw error;
  }
};

export const logoutAllDevices = async () => {
  try {
    const res = await api.post("/user/logoutAll-device");
    toast.success(res.data.message || "Logged out from all devices");
    return res.data;
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to logout from all devices",
    );
    throw error;
  }
};

export const getStarredFiles = async (
  page = 1,
  limit = 30,
  sortBy,
  filterBy,
) => {
  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);
    if (sortBy) params.append("sortBy", sortBy);
    if (filterBy) params.append("filterBy", filterBy);

    const res = await api.get(`/files/starred?${params.toString()}`);
    return res.data;
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to load starred files",
    );
    throw error;
  }
};

export const getRecentFiles = async (
  page = 1,
  limit = 30,
  sortBy,
  filterBy,
) => {
  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);
    if (sortBy) params.append("sortBy", sortBy);
    if (filterBy) params.append("filterBy", filterBy);

    const res = await api.get(`/files/recent?${params.toString()}`);
    return res.data;
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to load recent files",
    );
    throw error;
  }
};
