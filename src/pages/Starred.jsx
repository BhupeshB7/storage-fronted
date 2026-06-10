import { getStarredFiles, handleStarred } from "@/api/fileDirectoryApi";
import FilterSortBar from "@/components/FilterSortBar";
import FileCardSkeleton from "@/components/skeleton/FileCardSkeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ViewMorePagination from "@/components/ViewMorePagination";
import { directoryStore } from "@/store/directoryStore";
import getFileIcon from "@/utils/getFileIcon";
import {
  ArrowLeft,
  Calendar,
  Download,
  EllipsisVertical,
  FileImage,
  FileText,
  FileVideo,
  Star,
  Stars,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SORT_OPTIONS = [
  { value: "recent", label: "Recently Starred", icon: Calendar },
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

const Starred = () => {
  const navigate = useNavigate();
  const [starredFiles, setStarredFiles] = useState([]);
  const [allStarredFiles, setAllStarredFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("");
  const limit = 30;

  const loadDirectory = directoryStore.getState().loadDirectory;

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
      sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    return sorted;
  };

  const fetchStarredFiles = async (pageNum, append = false) => {
    try {
      setLoading(true);
      const res = await getStarredFiles(pageNum, limit);
      const newFiles = res.data || [];

      if (append) {
        setAllStarredFiles((prev) => [...prev, ...newFiles]);
      } else {
        setAllStarredFiles(newFiles);
      }

      setTotalCount(res.summary?.totalCount || 0);
      setHasMore(res.summary?.hasNextPage || false);
    } catch (err) {
      console.error("Error fetching starred files:", err);
      setAllStarredFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchStarredFiles(1, false);
  }, []);

  useEffect(() => {
    let filtered = applyClientSideFiltering(allStarredFiles, filterBy);
    let sorted = applyClientSideSorting(filtered, sortBy);
    setStarredFiles(sorted);
  }, [allStarredFiles, sortBy, filterBy]);

  useEffect(() => {
    let filtered = applyClientSideFiltering(allStarredFiles, filterBy);
    let sorted = applyClientSideSorting(filtered, sortBy);
    setStarredFiles(sorted);
  }, [allStarredFiles, sortBy, filterBy]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchStarredFiles(nextPage, true);
  };

  const handleShowLess = () => {
    setPage(1);
    setAllStarredFiles(allStarredFiles.slice(0, limit));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const handleFilterChange = (value) => {
    setFilterBy(value);
  };

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)]">
              ⭐ Starred Files
            </h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              View and manage your starred files.
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
        ) : starredFiles.length === 0 ? (
          <>
            <div className="text-center py-16 flex flex-col items-center justify-center text-[var(--muted-foreground)]">
              <div className="w-32 h-32 bg-[var(--surface-variant)] rounded-full flex items-center justify-center mb-6">
                <Stars className="w-16 h-16 text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold mb-1">
                No Starred Files Found
              </h2>
              <p className="text-sm text-[var(--muted-foreground)] max-w-md">
                You haven’t starred any files yet. Star files to quickly access
                them from here.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 mb-6">
              {starredFiles.map((fileItem) => (
                <div
                  key={fileItem._id}
                  className="relative p-4 border border-[var(--border)] rounded-lg bg-[var(--card)] hover:bg-[var(--surface-variant)] transition-colors duration-200 cursor-pointer"
                >
                  <a href={`/file/${fileItem._id}`} className="block">
                    <div className="flex items-center gap-3">
                      {getFileIcon(fileItem.name)}
                      <div>
                        <p className="font-medium text-[var(--foreground)]">
                          {fileItem.name}
                        </p>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {fileItem.extension}
                        </p>
                      </div>
                    </div>
                  </a>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                        <EllipsisVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={async () => {
                          await handleStarred(fileItem._id, loadDirectory);
                          setPage(1);
                          await fetchStarredFiles(1, false);
                        }}
                      >
                        <Star
                          className={`w-4 h-4 mr-2 ${
                            fileItem.isStarred
                              ? "text-gray-500 fill-gray-500"
                              : "text-gray-500"
                          }`}
                        />
                        {fileItem.isStarred
                          ? "Remove from Starred"
                          : "Add to Starred"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          (window.location.href = `http://localhost:3000/api/files/${fileItem._id}?action=download`)
                        }
                      >
                        <Download className="w-4 h-4 mr-2 text-gray-500" />
                        Download
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>

            <ViewMorePagination
              currentCount={starredFiles.length}
              totalCount={starredFiles.length}
              hasMore={hasMore}
              loading={loading}
              onLoadMore={handleLoadMore}
              onShowLess={handleShowLess}
              itemName="starred files"
            />
          </>
        )}
      </div>
    </>
  );
};

export default Starred;
