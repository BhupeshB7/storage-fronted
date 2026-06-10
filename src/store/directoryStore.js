import { fetchDirectory } from "@/api/fileDirectoryApi";
import { create } from "zustand";

export const directoryStore = create((set, get) => {
  return {
    directory: [],
    allFiles: [],
    loading: false,

    currentParentId: null,
    isCreateFolderModalOpen: false,

    filesSummary: {
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
      limit: 30,
      hasNextPage: false,
      hasPrevPage: false,
    },
    directoriesSummary: {
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
      limit: 30,
      hasNextPage: false,
      hasPrevPage: false,
    },

    loadDirectory: async (parentId, options = {}) => {
      const resolvedParentId = parentId ?? null;
      const { appendFiles = false, appendDirs = false } = options;

      set({
        loading: true,
        currentParentId: resolvedParentId,
      });

      try {
        const data = await fetchDirectory(resolvedParentId, options);
        const filteredFiles =
          data.files?.filter((file) => !file.isDeleted) || [];

        if (appendFiles) {
          set((state) => ({
            allFiles: [...state.allFiles, ...filteredFiles],
            filesSummary: data.filesSummary || state.filesSummary,
          }));
        } else if (appendDirs) {
          set((state) => ({
            directory: [...state.directory, ...(data.directories || [])],
            directoriesSummary:
              data.directoriesSummary || state.directoriesSummary,
          }));
        } else {
          set({
            directory: data.directories || [],
            allFiles: filteredFiles,
            filesSummary: data.filesSummary || {
              totalCount: filteredFiles.length,
              totalPages: 1,
              currentPage: 1,
              limit: 30,
              hasNextPage: false,
              hasPrevPage: false,
            },
            directoriesSummary: data.directoriesSummary || {
              totalCount: (data.directories || []).length,
              totalPages: 1,
              currentPage: 1,
              limit: 30,
              hasNextPage: false,
              hasPrevPage: false,
            },
          });
        }
      } catch (error) {
        set({ directory: [], allFiles: [] });
      } finally {
        set({ loading: false });
      }
    },

    refetch: async () => {
      const parentId = get().currentParentId;
      await get().loadDirectory(parentId);
    },

    openCreateFolderModal: () => {
      set({ isCreateFolderModalOpen: true });
    },

    closeCreateFolderModal: () => {
      set({ isCreateFolderModalOpen: false });
    },
  };
});
