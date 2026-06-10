import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import FilterSortBar from "@/components/FilterSortBar";
import FuzzySearchBar from "@/components/FuzzySearchBar";
import CreateDirectoryModal from "@/components/modals/CreateDirectoryModal";
import DetailsModal from "@/components/modals/DetailsModal";
import ManageShareModal from "@/components/modals/ManageShareModal";
import RenameModal from "@/components/modals/RenameModal";
import ShareModal from "@/components/modals/ShareModal";

import {
  deleteBulkFiles,
  deleteFile,
  handleCreateDirectory,
  handleDeleteDir,
  handleRenameDirOrFile,
  handleStarred,
} from "@/api/fileDirectoryApi";
import { directoryStore } from "@/store/directoryStore";

import {
  ArrowDownWideNarrow,
  ArrowDownZA,
  ArrowUpAZ,
  ArrowUpNarrowWide,
  CalendarArrowUp,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronUp,
  EllipsisVertical,
  FileIcon,
  FileImage,
  FileText,
  FileVideo,
  Folder,
  Info,
  LayoutGrid,
  LayoutList,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Breadcrumb from "@/components/BreadCrumb";
import FileItem from "@/components/FileItem";
import FileUpload from "@/components/FileUpload";
import FileCardSkeleton from "@/components/skeleton/FileCardSkeleton";
import { Button } from "@/components/ui/button";
import { useLayoutStore } from "@/store/useLayoutStore";
const SORT_OPTIONS = [
  { value: "recent", label: "Recently Added", icon: CalendarClock },
  { value: "oldest", label: "Oldest First", icon: CalendarArrowUp },
  { value: "name_asc", label: "Name (A-Z)", icon: ArrowUpAZ },
  { value: "name_desc", label: "Name (Z-A)", icon: ArrowDownZA },
  {
    value: "size_desc",
    label: "Size (Large First)",
    icon: ArrowDownWideNarrow,
  },
  { value: "size_asc", label: "Size (Small First)", icon: ArrowUpNarrowWide },
];

const FILTER_OPTIONS = [
  { value: "", label: "All Files", icon: FileText },
  { value: "pdf", label: "PDF Files", icon: FileText },
  { value: "image", label: "Images", icon: FileImage },
  { value: "video", label: "Videos", icon: FileVideo },
  { value: "document", label: "Documents", icon: FileText },
];
const MyDrive = () => {
  const { parentId } = useParams();

  const directory = directoryStore((state) => state.directory);
  const allFiles = directoryStore((state) => state.allFiles);
  const loading = directoryStore((state) => state.loading);
  const loadDirectory = directoryStore((state) => state.loadDirectory);
  const filesSummary = directoryStore((state) => state.filesSummary);
  const directoriesSummary = directoryStore(
    (state) => state.directoriesSummary,
  );
  const isCreateFolderModalOpen = directoryStore(
    (state) => state.isCreateFolderModalOpen,
  );
  const openCreateFolderModal = directoryStore(
    (state) => state.openCreateFolderModal,
  );
  const closeCreateFolderModal = directoryStore(
    (state) => state.closeCreateFolderModal,
  );
  const currentParentId = directoryStore((state) => state.currentParentId);

  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [manageShareModalOpen, setManageShareModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [renameData, setRenameData] = useState({ type: "", id: "", value: "" });
  const [detailsType, setDetailsType] = useState("file");
  const [newDirname, setNewDirname] = useState("");

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectionType, setSelectionType] = useState(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("");
  const [filteredSortedFiles, setFilteredSortedFiles] = useState([]);
  const [filesPage, setFilesPage] = useState(1);
  const [dirsPage, setDirsPage] = useState(1);

  const { layout, setLayout } = useLayoutStore();

  const applyClientSideFiltering = (files, filter) => {
    if (!filter) return files;

    return files.filter((file) => {
      const ext = file.extension?.toLowerCase() || "";
      if (filter === "pdf") return ext === ".pdf";
      if (filter === "image")
        return [
          ".jpg",
          ".jpeg",
          ".png",
          ".gif",
          ".bmp",
          ".svg",
          ".webp",
        ].includes(ext);
      if (filter === "video")
        return [".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv"].includes(ext);
      if (filter === "document")
        return [".doc", ".docx", ".txt", ".rtf", ".odt"].includes(ext);
      return true;
    });
  };

  const applyClientSideSorting = (files, sort) => {
    const sorted = [...files];

    if (sort === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "name_desc") {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sort === "size") {
      sorted.sort((a, b) => (b.size || 0) - (a.size || 0));
    } else if (sort === "size_small") {
      sorted.sort((a, b) => (a.size || 0) - (b.size || 0));
    } else if (sort === "recent") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === "oldest") {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    return sorted;
  };

  useEffect(() => {
    if (parentId !== currentParentId || !directory.length) {
      loadDirectory(parentId ?? null);
      setFilesPage(1);
      setDirsPage(1);
    }
  }, [parentId, currentParentId, loadDirectory, directory.length]);

  useEffect(() => {
    let filtered = applyClientSideFiltering(allFiles, filterBy);
    let sorted = applyClientSideSorting(filtered, sortBy);
    setFilteredSortedFiles(sorted);
  }, [allFiles, sortBy, filterBy]);

  useEffect(() => {
    if (isSelectionMode && selectedItems.size === 0) {
      setIsSelectionMode(false);
      setSelectionType(null);
    }
  }, [selectedItems, isSelectionMode]);

  const handleShowDetails = (type, id) => {
    setDetailsType(type);
    setSelectedItem(id);
    setDetailsModalOpen(true);
  };

  const handleOpenRenameModal = (type, id, value) => {
    setRenameData({ type, id, value });
    setRenameModalOpen(true);
  };

  const handleRename = async (e) => {
    e.preventDefault();
    const success = await handleRenameDirOrFile(
      renameData.type,
      renameData.id,
      renameData.value,
      loadDirectory,
    );
    if (success) setRenameModalOpen(false);
  };

  const handleModalCreate = async (e) => {
    e.preventDefault();
    const success = await handleCreateDirectory(
      parentId ?? null,
      newDirname,
      () => {
        loadDirectory(parentId ?? null);
      },
    );

    if (success) {
      setNewDirname("");
      closeCreateFolderModal();
    }
  };

  const handleDeleteDirectory = async (id) => {
    await handleDeleteDir(id, loadDirectory);
  };

  const handleDeleteFile = async (id) => {
    await deleteFile(id, loadDirectory);
  };

  const handleStarFile = async (id) => {
    await handleStarred(id, loadDirectory);
  };

  const handleFilesLoadMore = () => {
    const nextPage = filesPage + 1;
    setFilesPage(nextPage);
    loadDirectory(parentId ?? null, {
      page: nextPage,
      limit: 30,
      appendFiles: true,
    });
  };

  const handleFilesShowLess = () => {
    setFilesPage(1);
    loadDirectory(parentId ?? null, { page: 1, limit: 30 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDirsLoadMore = () => {
    const nextPage = dirsPage + 1;
    setDirsPage(nextPage);
    loadDirectory(parentId ?? null, {
      page: nextPage,
      limit: 30,
      appendDirs: true,
    });
  };

  const handleDirsShowLess = () => {
    setDirsPage(1);
    loadDirectory(parentId ?? null, { page: 1, limit: 30 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const handleFilterChange = (value) => {
    setFilterBy(value);
  };

  const enterSelectionMode = (itemType, itemId = null) => {
    setIsSelectionMode(true);
    setSelectionType(itemType);
    const newSelection = new Set();

    if (itemId) {
      newSelection.add(`${itemType}-${itemId}`);
    }

    setSelectedItems(newSelection);
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedItems(new Set());
    setSelectionType(null);
  };

  const toggleItemSelection = (itemId, itemType) => {
    if (selectionType && itemType !== selectionType) {
      return;
    }

    const newSelection = new Set(selectedItems);
    const key = `${itemType}-${itemId}`;

    if (newSelection.has(key)) {
      newSelection.delete(key);
    } else {
      newSelection.add(key);
    }

    setSelectedItems(newSelection);
  };

  const selectAllItems = () => {
    if (!selectionType) return;

    const newSelection = new Set();

    if (selectionType === "folder") {
      directory.forEach((dir) => newSelection.add(`folder-${dir._id}`));
    } else if (selectionType === "file") {
      allFiles.forEach((file) => newSelection.add(`file-${file._id}`));
    }

    setSelectedItems(newSelection);
  };

  const isItemSelected = (itemId, itemType) => {
    return selectedItems.has(`${itemType}-${itemId}`);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    const filesToDelete = [];
    const foldersToDelete = [];

    selectedItems.forEach((item) => {
      const [type, id] = item.split("-");
      if (type === "file") {
        filesToDelete.push(id);
      } else if (type === "folder") {
        foldersToDelete.push(id);
      }
    });

    try {
      if (filesToDelete.length > 0) {
        // const success = await bulkDelete(filesToDelete);
        const success = await deleteBulkFiles(filesToDelete);
        if (success) {
          loadDirectory(parentId ?? null);
          exitSelectionMode();
        }
      }

      for (const folderId of foldersToDelete) {
        await handleDeleteDir(folderId, loadDirectory);
      }
    } catch (error) {
      console.error("Bulk delete failed:", error);
    }
  };

  const canSelectItem = (itemType) => {
    return !isSelectionMode || !selectionType || selectionType === itemType;
  };

  if (loading) {
    return (
      <div className="p-4">
        <FuzzySearchBar />

        <div className="flex items-center justify-between mb-4">
          <div className="w-32 h-8 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
          <div className="w-32 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-xl animate-pulse"></div>
        </div>

        <div className="w-48 h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse mb-8"></div>

        <div className="mt-8">
          <div className="w-24 h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                  <div className="flex-1 h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <div className="w-32 h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
            <div className="w-24 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-lg animate-pulse"></div>
          </div>

          <div
            className={
              layout === "grid"
                ? "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-4"
                : "space-y-4"
            }
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <FileCardSkeleton key={i} layout={layout} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <FuzzySearchBar />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">My Drive</h1>
        <div className="flex gap-2">
          <Button
            onClick={openCreateFolderModal}
            className="!rounded-none px-6 py-3 flex items-center font-medium transition-all duration-200 rounded-xl shadow-sm bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Folder
          </Button>
        </div>
      </div>
      <Breadcrumb currentDirId={currentParentId} />

      {isSelectionMode && (
        <div className="flex items-center justify-between p-4 mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={exitSelectionMode}
              className="text-zinc-600 shrink-0"
            >
              <X className="w-4 h-4 sm:mr-1" />
              <span className="inline">Cancel</span>
            </Button>

            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
              {selectedItems.size}{" "}
              {selectionType === "file" ? "file" : "folder"}(s) selected
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={selectAllItems}
              className="text-blue-600 shrink-0 ml-auto sm:ml-0"
            >
              <span className="text-xs sm:text-sm">
                Select All {selectionType === "file" ? "Files" : "Folders"}
              </span>
            </Button>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setBulkDeleteDialogOpen(true)}
            disabled={selectedItems.size === 0}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete Selected ({selectedItems.size})
          </Button>
        </div>
      )}

      <FolderSection
        directory={directory}
        directoriesSummary={directoriesSummary}
        loading={loading}
        onLoadMore={handleDirsLoadMore}
        onShowLess={handleDirsShowLess}
        onRename={handleOpenRenameModal}
        onDelete={handleDeleteDirectory}
        showDetails={handleShowDetails}
        isSelectionMode={isSelectionMode}
        selectionType={selectionType}
        canSelectItem={canSelectItem}
        isItemSelected={isItemSelected}
        toggleItemSelection={toggleItemSelection}
        enterSelectionMode={enterSelectionMode}
      />

      <FileSection
        files={filteredSortedFiles}
        filesSummary={filesSummary}
        loading={loading}
        sortBy={sortBy}
        filterBy={filterBy}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
        onLoadMore={handleFilesLoadMore}
        onShowLess={handleFilesShowLess}
        layout={layout}
        setLayout={setLayout}
        hasFolders={directory.length > 0}
        parentId={parentId}
        loadDirectory={loadDirectory}
        isSelectionMode={isSelectionMode}
        selectionType={selectionType}
        canSelectItem={canSelectItem}
        isItemSelected={isItemSelected}
        toggleItemSelection={toggleItemSelection}
        enterSelectionMode={enterSelectionMode}
        handleDeleteFile={handleDeleteFile}
        handleStarFile={handleStarFile}
        handleShowDetails={handleShowDetails}
        handleOpenRenameModal={handleOpenRenameModal}
        setShareModalOpen={setShareModalOpen}
        setManageShareModalOpen={setManageShareModalOpen}
        setSelectedFile={setSelectedFile}
      />

      {isCreateFolderModalOpen && (
        <CreateDirectoryModal
          newDirname={newDirname}
          setNewDirname={setNewDirname}
          onClose={closeCreateFolderModal}
          onCreateDirectory={async (e) => {
            e.preventDefault();

            const success = await handleCreateDirectory(
              currentParentId,
              newDirname,
              () => loadDirectory(currentParentId),
            );

            if (success) {
              setNewDirname("");
              closeCreateFolderModal();
            }
          }}
        />
      )}

      {renameModalOpen && (
        <RenameModal
          renameType={renameData.type}
          renameValue={renameData.value}
          setRenameValue={(val) => setRenameData({ ...renameData, value: val })}
          onClose={() => setRenameModalOpen(false)}
          onRenameSubmit={handleRename}
        />
      )}

      {detailsModalOpen && selectedItem && (
        <DetailsModal
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedItem(null);
          }}
          type={detailsType}
          id={selectedItem}
        />
      )}

      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Items</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedItems.size} selected{" "}
              {selectionType === "file" ? "file" : "folder"}
              {selectedItems.size > 1 ? "s" : ""}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleBulkDelete();
                setBulkDeleteDialogOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700  hover:text-white dark:text-gray-300 dark:hover:text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {shareModalOpen && selectedFile && (
        <ShareModal
          file={selectedFile}
          onClose={() => {
            setShareModalOpen(false);
            setSelectedFile(null);
          }}
          onSuccess={() => loadDirectory(parentId ?? null)}
        />
      )}

      {manageShareModalOpen && selectedFile && (
        <ManageShareModal
          file={selectedFile}
          onClose={() => {
            setManageShareModalOpen(false);
            setSelectedFile(null);
          }}
        />
      )}
    </div>
  );
};

const FolderSection = ({
  directory,
  directoriesSummary,
  loading,
  onLoadMore,
  onShowLess,
  onRename,
  onDelete,
  showDetails,
  isSelectionMode,
  selectionType,
  canSelectItem,
  isItemSelected,
  toggleItemSelection,
  enterSelectionMode,
}) => {
  if (directory.length === 0) {
    return (
      <p className="text-[var(--muted-foreground)] text-center max-w-md mb-8">
        No sub-folder. Create a new one!
      </p>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-[var(--foreground)] mb-4">
        Folders
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {directory.map((folder) => (
          <div
            key={folder._id}
            className={`relative ${
              isSelectionMode && isItemSelected(folder._id, "folder")
                ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : ""
            } ${
              isSelectionMode && !canSelectItem("folder")
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <div
              className={`p-4 border border-[var(--border)] rounded-lg bg-[var(--card)] hover:bg-[var(--surface-variant)] transition-colors duration-200 flex items-center gap-3 ${
                isSelectionMode && canSelectItem("folder")
                  ? "cursor-pointer"
                  : ""
              }`}
              onClick={(e) => {
                if (isSelectionMode && canSelectItem("folder")) {
                  e.preventDefault();
                  toggleItemSelection(folder._id, "folder");
                }
              }}
            >
              {isSelectionMode && canSelectItem("folder") && (
                <div className="mr-2">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isItemSelected(folder._id, "folder")
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white border-zinc-300 dark:bg-zinc-800 dark:border-zinc-600"
                    }`}
                  >
                    {isItemSelected(folder._id, "folder") && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              )}
              <Link
                to={`/directory/${folder._id}`}
                className={`flex items-center gap-3 flex-1 ${
                  isSelectionMode ? "pointer-events-none" : ""
                }`}
              >
                <Folder className="w-6 h-6 text-zinc-500" />
                <span className="font-medium text-[var(--foreground)] truncate">
                  {folder.name}
                </span>
              </Link>

              {!isSelectionMode && (
                <FolderDropdown
                  folder={folder}
                  onRename={onRename}
                  onDelete={onDelete}
                  showDetails={showDetails}
                  enterSelectionMode={enterSelectionMode}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-3 mt-6">
        {directoriesSummary.hasNextPage && (
          <Button
            onClick={onLoadMore}
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            {loading ? "Loading..." : "View More"}
            <ChevronDown className="w-4 h-4" />
          </Button>
        )}

        {directory.length > 30 && onShowLess && (
          <Button onClick={onShowLess} variant="ghost" className="gap-2">
            Show Less
            <ChevronUp className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

const FolderDropdown = ({
  folder,
  onRename,
  onDelete,
  showDetails,
  enterSelectionMode,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 rounded hover:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors">
          <EllipsisVertical className="w-5 h-5 text-zinc-400 dark:text-zinc-300" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-40 bg-zinc-900 dark:bg-zinc-800 shadow-lg rounded-md border border-zinc-700"
      >
        <DropdownMenuItem
          onClick={() => enterSelectionMode("folder", folder._id)}
          className="text-zinc-300 hover:text-zinc-50 hover:bg-zinc-700 dark:hover:bg-zinc-600 flex items-center"
        >
          <Check className="w-4 h-4 mr-2 text-zinc-400" />
          Select
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onRename("folder", folder._id, folder.name)}
          className="text-zinc-300 hover:text-zinc-50 hover:bg-zinc-700 dark:hover:bg-zinc-600 flex items-center"
        >
          <Pencil className="w-4 h-4 mr-2 text-zinc-400" />
          Rename
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => showDetails("folder", folder._id)}
          className="text-zinc-300 hover:text-zinc-50 hover:bg-zinc-700 dark:hover:bg-zinc-600 flex items-center"
        >
          <Info className="w-4 h-4 mr-2 text-zinc-400" />
          Details
        </DropdownMenuItem>

        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="text-red-500 hover:bg-red-600 dark:hover:bg-red-700 flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2 text-red-500" />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Folder</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <b>{folder.name}</b>? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(folder._id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const FileSection = ({
  files,
  filesSummary,
  loading,
  sortBy,
  filterBy,
  onSortChange,
  onFilterChange,
  onLoadMore,
  onShowLess,
  layout,
  setLayout,
  hasFolders,
  parentId,
  loadDirectory,
  isSelectionMode,
  selectionType,
  canSelectItem,
  isItemSelected,
  toggleItemSelection,
  enterSelectionMode,
  handleDeleteFile,
  handleStarFile,
  handleShowDetails,
  handleOpenRenameModal,
  handleCopyLink,
  setShareModalOpen,
  setManageShareModalOpen,
  setSelectedFile,
}) => {
  if (files.length === 0) {
    return hasFolders ? (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-32 h-32 bg-[var(--surface-variant)] rounded-full flex items-center justify-center mb-6">
          <FileIcon className="w-16 h-16 text-zinc-400" />
        </div>
        <p className="text-[var(--muted-foreground)] text-center max-w-md mb-8">
          Your drive is empty. Upload files to get started.
        </p>
        <FileUpload parentDirId={parentId} onUploadSuccess={loadDirectory} />
      </div>
    ) : null;
  }

  return (
    <div className="mt-16 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-[var(--foreground)]">
          Files ({filesSummary.totalCount})
        </h3>
        <FileViewModeToggle layout={layout} setLayout={setLayout} />
      </div>

      <div className="mb-6">
        <FilterSortBar
          sortBy={sortBy}
          onSortChange={onSortChange}
          filterBy={filterBy}
          onFilterChange={onFilterChange}
          sortOptions={SORT_OPTIONS}
          filterOptions={FILTER_OPTIONS}
        />
      </div>

      <div
        className={
          layout === "grid"
            ? "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-4 w-full mb-6"
            : "space-y-2 mb-6"
        }
      >
        {files.map((fileItem) => (
          <FileItem
            key={fileItem._id}
            file={fileItem}
            layout={layout}
            isSelectionMode={isSelectionMode}
            selectionType={selectionType}
            isSelected={isItemSelected(fileItem._id, "file")}
            canSelectItem={canSelectItem("file")}
            onToggleSelection={() => toggleItemSelection(fileItem._id, "file")}
            onRename={() =>
              handleOpenRenameModal("file", fileItem._id, fileItem.name)
            }
            onDelete={() => handleDeleteFile(fileItem._id)}
            onStar={() => handleStarFile(fileItem._id)}
            onShowDetails={() => handleShowDetails("file", fileItem._id)}
            onCopyLink={() => handleCopyLink(fileItem._id)}
            onEnterSelectionMode={() =>
              enterSelectionMode("file", fileItem._id)
            }
            setShareModalOpen={setShareModalOpen}
            setManageShareModalOpen={setManageShareModalOpen}
            setSelectedFile={setSelectedFile}
          />
        ))}
      </div>

      <div className="flex justify-center gap-3 mt-6">
        {filesSummary.hasNextPage && (
          <Button
            onClick={onLoadMore}
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            {loading ? "Loading..." : "View More"}
            <ChevronDown className="w-4 h-4" />
          </Button>
        )}

        {files.length > 30 && onShowLess && (
          <Button onClick={onShowLess} variant="ghost" className="gap-2">
            Show Less
            <ChevronUp className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

const FileViewModeToggle = ({ layout, setLayout }) => (
  <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-900 p-2 rounded-lg">
    <button
      onClick={() => setLayout("list")}
      className={`p-2 rounded-lg transition-all duration-200 ${
        layout === "list"
          ? "bg-blue-500 text-white shadow-md"
          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
      }`}
    >
      <LayoutList className="w-5 h-5" />
    </button>

    <button
      onClick={() => setLayout("grid")}
      className={`p-2 rounded-lg transition-all duration-200 ${
        layout === "grid"
          ? "bg-blue-500 text-white shadow-md"
          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
      }`}
    >
      <LayoutGrid className="w-5 h-5" />
    </button>
  </div>
);

export default MyDrive;
