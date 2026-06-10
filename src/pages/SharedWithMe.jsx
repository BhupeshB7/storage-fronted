import {
  deleteFile,
  getSharedFiles,
  handleRenameDirOrFile,
  handleStarred,
} from "@/api/fileDirectoryApi";
import FilterSortBar from "@/components/FilterSortBar";
import DetailsModal from "@/components/modals/DetailsModal";
import RenameModal from "@/components/modals/RenameModal";
import FileCardSkeleton from "@/components/skeleton/FileCardSkeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ViewMorePagination from "@/components/ViewMorePagination";
import {
  formatFileSize,
  formatTimeAgo,
  getFileIconComponent,
} from "@/utils/fileHelpers";
import {
  ArrowLeft,
  Calendar,
  Download,
  Edit,
  EllipsisVertical,
  Eye,
  FileImage,
  FileText,
  FileVideo,
  Info,
  Pencil,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SORT_OPTIONS = [
  { value: "recent", label: "Recently Shared", icon: Calendar },
  { value: "name", label: "Name (A-Z)", icon: FileText },
  { value: "name_desc", label: "Name (Z-A)", icon: FileText },
  { value: "size", label: "Size (Large First)", icon: FileText },
  { value: "size_small", label: "Size (Small First)", icon: FileText },
];

const FILTER_OPTIONS = [
  { value: "", label: "All Files", icon: FileText },
  { value: "pdf", label: "PDF Files", icon: FileText },
  { value: "image", label: "Images", icon: FileImage },
  { value: "video", label: "Videos", icon: FileVideo },
  { value: "document", label: "Documents", icon: FileText },
];

function SharedWithMe() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("");
  const limit = 30;
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [renameData, setRenameData] = useState({ type: "", id: "", value: "" });

  const applyClientSideFiltering = (files, filter) => {
    if (!filter) return files;

    return files.filter((item) => {
      const ext = item.file?.extension?.toLowerCase() || "";
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
      sorted.sort((a, b) =>
        (a.file?.name || "").localeCompare(b.file?.name || ""),
      );
    } else if (sort === "name_desc") {
      sorted.sort((a, b) =>
        (b.file?.name || "").localeCompare(a.file?.name || ""),
      );
    } else if (sort === "size") {
      sorted.sort((a, b) => (b.file?.size || 0) - (a.file?.size || 0));
    } else if (sort === "size_small") {
      sorted.sort((a, b) => (a.file?.size || 0) - (b.file?.size || 0));
    } else if (sort === "recent") {
      sorted.sort((a, b) => new Date(b.sharedAt) - new Date(a.sharedAt));
    }

    return sorted;
  };

  const fetchSharedFiles = async (pageNum, append = false) => {
    try {
      setLoading(true);
      const data = await getSharedFiles(pageNum, limit);
      const newFiles = data || [];

      if (append) {
        setAllFiles((prev) => [...prev, ...newFiles]);
      } else {
        setAllFiles(newFiles);
      }

      setTotalCount(newFiles.length);
      setHasMore(newFiles.length >= limit);
    } catch (error) {
      console.error("Error fetching shared files:", error);
      setAllFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchSharedFiles(1, false);
  }, []);

  useEffect(() => {
    let filtered = applyClientSideFiltering(allFiles, filterBy);
    let sorted = applyClientSideSorting(filtered, sortBy);
    setFiles(sorted);
  }, [allFiles, sortBy, filterBy]);

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const handleFilterChange = (value) => {
    setFilterBy(value);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSharedFiles(nextPage, true);
  };

  const handleShowLess = () => {
    setPage(1);
    setAllFiles(allFiles.slice(0, limit));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDownload = (fileId) => {
    window.location.href = `http://localhost:3000/api/files/${fileId}?action=download`;
  };

  const handleDeleteFile = async (fileId) => {
    const success = await deleteFile(fileId);
    if (success) {
      setPage(1);
      fetchSharedFiles(1, false);
    }
  };

  const handleStarFile = async (fileId) => {
    setFiles((prevFiles) =>
      prevFiles.map((item) =>
        item.file?.id === fileId
          ? {
              ...item,
              file: {
                ...item.file,
                isStarred: !item.file.isStarred,
              },
            }
          : item,
      ),
    );
    const success = await handleStarred(fileId);
    if (success) {
      setPage(1);
      await fetchSharedFiles(1, false);
    }
  };

  const handleOpenRenameModal = (fileId, fileName) => {
    setRenameData({ type: "file", id: fileId, value: fileName });
    setRenameModalOpen(true);
  };

  const handleShowDetails = (fileId) => {
    setSelectedFile(fileId);
    setDetailsModalOpen(true);
  };

  const handleRename = async (e) => {
    if (e) e.preventDefault();
    const success = await handleRenameDirOrFile(
      renameData.type,
      renameData.id,
      renameData.value,
      () => {
        setPage(1);
        fetchSharedFiles(1, false);
      },
    );
    if (success) {
      setRenameModalOpen(false);
      setRenameData({ type: "", id: "", value: "" });
      setPage(1);
      await fetchSharedFiles(1, false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Users className="w-8 h-8" />
            Shared With Me
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Files that others have shared with you
          </p>
        </div>
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <div className="mb-6">
        <FilterSortBar
          sortBy={sortBy}
          onSortChange={handleSortChange}
          filterBy={filterBy}
          onFilterChange={handleFilterChange}
          sortOptions={SORT_OPTIONS}
          filterOptions={FILTER_OPTIONS}
        />
      </div>

      {loading && page === 1 ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <FileCardSkeleton key={i} layout="list" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center justify-center">
          <div className="w-32 h-32 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
            <Users className="w-16 h-16 text-zinc-400" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
            No Shared Files
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
            When someone shares a file with you, it will appear here
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {files.map((item) => {
              const file = item.file;
              const fileId = file?.id;
              const permission = item.permission;
              const sharedBy = item.ownerEmail || item.ownerName || "Unknown";

              if (!file || !fileId) {
                console.error("Missing file or file ID for item:", item);
                return null;
              }

              const fileIcon = getFileIconComponent(file.name, "default");
              const timeAgo = formatTimeAgo(item.sharedAt);
              const fileSize = file.size ? formatFileSize(file.size) : null;
              const fileExtension =
                file.extension?.replace(".", "").toUpperCase() || "FILE";

              return (
                <div
                  key={item.id}
                  className="flex items-center p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-colors duration-200"
                >
                  <a
                    href={`/file/${fileId}`}
                    className="flex items-center flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">{fileIcon}</div>

                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-zinc-800 dark:text-zinc-100 truncate">
                            {file.name}
                          </h3>
                          <span className="flex-shrink-0 text-xs font-medium px-2 py-0.5 bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full">
                            {fileExtension}
                          </span>
                          {permission === "VIEW" ? (
                            <span className="flex-shrink-0 flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                              <Eye className="w-3 h-3" />
                              View Only
                            </span>
                          ) : (
                            <span className="flex-shrink-0 flex items-center gap-1 text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                              <Edit className="w-3 h-3" />
                              Can Edit
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                          <span>Shared by {sharedBy}</span>
                          {fileSize && <span>{fileSize}</span>}
                          <span>{timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  </a>

                  <DropdownMenu key={`${fileId}-${file.isStarred}`}>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors ml-2">
                        <EllipsisVertical className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {permission === "EDIT" && (
                        <>
                          <DropdownMenuItem
                            onClick={() =>
                              handleOpenRenameModal(fileId, file.name)
                            }
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteFile(fileId)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={() => handleShowDetails(fileId)}
                      >
                        <Info className="w-4 h-4 mr-2" />
                        Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStarFile(fileId)}>
                        <Star
                          className={`w-4 h-4 mr-2 ${
                            file.isStarred
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-zinc-500"
                          }`}
                        />
                        {file.isStarred
                          ? "Remove from Starred"
                          : "Add to Starred"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(fileId)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>

          <ViewMorePagination
            currentCount={files.length}
            totalCount={totalCount}
            hasMore={hasMore}
            loading={loading}
            onLoadMore={handleLoadMore}
            onShowLess={handleShowLess}
            itemName="shared files"
          />
        </>
      )}

      {renameModalOpen && (
        <RenameModal
          renameType={renameData.type}
          renameValue={renameData.value}
          setRenameValue={(value) =>
            setRenameData((prev) => ({ ...prev, value }))
          }
          onClose={() => {
            setRenameModalOpen(false);
            setRenameData({ type: "", id: "", value: "" });
          }}
          onRenameSubmit={handleRename}
        />
      )}

      {detailsModalOpen && selectedFile && (
        <DetailsModal
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedFile(null);
          }}
          id={selectedFile}
          type="file"
        />
      )}
    </div>
  );
}

export default SharedWithMe;
