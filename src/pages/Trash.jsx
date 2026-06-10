import {
  allTrashFiles as fetchAllTrashFiles,
  restoreTrashFile,
} from "@/api/fileDirectoryApi";
import FilterSortBar from "@/components/FilterSortBar";
import FileCardSkeleton from "@/components/skeleton/FileCardSkeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ViewMorePagination from "@/components/ViewMorePagination";
import {
  AlertCircle,
  ArrowLeftSquare,
  Calendar,
  Clock,
  EllipsisVertical,
  FileImage,
  FileText,
  FileVideo,
  Folder,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SORT_OPTIONS = [
  { value: "recent", label: "Recently Deleted", icon: Calendar },
  { value: "oldest", label: "Oldest First", icon: Calendar },
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

const Trash = () => {
  const [trashFiles, setTrashFiles] = useState([]);
  const [allTrashFiles, setAllTrashFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("");
  const limit = 30;
  const navigate = useNavigate();

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

  const fetchTrashFiles = async (pageNum, append = false) => {
    try {
      setLoading(true);
      const res = await fetchAllTrashFiles(pageNum, limit);
      const newFiles = res.data || [];

      if (append) {
        setAllTrashFiles((prev) => [...prev, ...newFiles]);
      } else {
        setAllTrashFiles(newFiles);
      }

      setTotalCount(res.total || 0);
      setHasMore(pageNum < (res.pages || 1));
    } catch (error) {
      console.error("Error fetching trash files:", error);
      setAllTrashFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchTrashFiles(1, false);
  }, []);

  useEffect(() => {
    let filtered = applyClientSideFiltering(allTrashFiles, filterBy);
    let sorted = applyClientSideSorting(filtered, sortBy);
    setTrashFiles(sorted);
  }, [allTrashFiles, sortBy, filterBy]);

  const goBack = () => navigate(-1);

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const handleFilterChange = (value) => {
    setFilterBy(value);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTrashFiles(nextPage, true);
  };

  const handleShowLess = () => {
    setPage(1);
    setAllTrashFiles(allTrashFiles.slice(0, limit));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRestore = async (fileItem) => {
    await restoreTrashFile(fileItem._id, () => {
      setPage(1);
      fetchTrashFiles(1, false);
    });
  };

  const handleDeleteForever = (fileItem) => {
    if (
      window.confirm(
        `Permanently delete "${fileItem.name}"? This action cannot be undone.`,
      )
    ) {
      alert(`Deleting file forever: ${fileItem.name}`);
    }
  };

  const handleOpenFile = (fileItem) => {
    navigate(`/file/${fileItem._id}`);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={goBack}
              className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
            >
              <ArrowLeftSquare className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-900/10 rounded-xl">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Trash
                </h1>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {totalCount} files • Will be deleted in 30 days
                  </span>
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-xs font-medium">Important</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
        ) : trashFiles.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <div className="flex flex-col items-center justify-center py-20 px-6">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-zinc-800 dark:to-zinc-900 rounded-full flex items-center justify-center mb-6 border border-gray-200 dark:border-zinc-800">
                <Trash2 className="w-10 h-10 text-gray-400 dark:text-zinc-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                No files in trash
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
                Files you delete will appear here and will be automatically
                removed after 30 days.
              </p>
              <button
                onClick={goBack}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <ArrowLeftSquare className="w-4 h-4" />
                Go Back to Files
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
                  <thead className="bg-gray-50 dark:bg-zinc-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        File Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        <Folder className="w-4 h-4 inline mr-2" />
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Deleted On
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                    {trashFiles.map((fileItem) => {
                      const deletedDate = new Date(fileItem.createdAt);
                      const daysLeft =
                        30 -
                        Math.floor(
                          (Date.now() - deletedDate.getTime()) /
                            (1000 * 60 * 60 * 24),
                        );

                      return (
                        <tr
                          key={fileItem._id}
                          className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30">
                                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {fileItem.name}
                                  </p>
                                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 font-medium">
                                    {fileItem.extension}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Clock className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                                  <span
                                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                      daysLeft < 7
                                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                    }`}
                                  >
                                    {daysLeft > 0
                                      ? `${daysLeft} days left`
                                      : "Expired"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Folder className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                {fileItem.parentDirName || "Root"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {deletedDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {deletedDate.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors duration-150 shadow-xs">
                                  <EllipsisVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-56 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg py-1"
                              >
                                <DropdownMenuItem
                                  onClick={() => handleOpenFile(fileItem)}
                                  className="px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer flex items-center gap-2"
                                >
                                  <FileText className="w-4 h-4 text-blue-500" />
                                  <span>Preview File</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => handleRestore(fileItem)}
                                  className="px-3 py-2.5 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer flex items-center gap-2"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  <span>Restore</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="my-1 bg-gray-200 dark:bg-zinc-700" />

                                <DropdownMenuItem
                                  onClick={() => handleDeleteForever(fileItem)}
                                  className="px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Delete permanently</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <ViewMorePagination
              currentCount={trashFiles.length}
              totalCount={totalCount}
              hasMore={hasMore}
              loading={loading}
              onLoadMore={handleLoadMore}
              onShowLess={handleShowLess}
              itemName="trash files"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Trash;
