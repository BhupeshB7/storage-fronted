import {
  api,
  getSharedFiles,
  handleRenameDirOrFile,
} from "@/api/fileDirectoryApi";
import ImageView from "@/components/ImageView";
import RenameModal from "@/components/modals/RenameModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { directoryStore } from "@/store/directoryStore";
import { formatDateTime } from "@/utils/formatDate";
import {
  ArrowLeft,
  Download,
  EllipsisVertical,
  File,
  FileText,
  Image,
  Info,
  Pencil,
  Share,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const FileViewer = ({ mode }) => {
  const { fileId } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [renameType, setRenameType] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameId, setRenameId] = useState("");
  const [permission, setPermission] = useState(null);
  const [isSharedFile, setIsSharedFile] = useState(false);
  const refetch = directoryStore.getInitialState().refetch;
  const handleOpenRenameModalOpen = (type, id, value) => {
    setRenameType(type);
    setRenameId(id);
    setRenameValue(value);
    setIsRenameModalOpen(true);
  };

  const handleRename = async (e) => {
    e.preventDefault();
    const success = await handleRenameDirOrFile(
      renameType,
      renameId,
      renameValue,
      refetch,
    );
    if (success) {
      setIsRenameModalOpen(false);
    }
  };
  useEffect(() => {
    fetchFileData(fileId);
    checkFilePermission(fileId);
    api.patch(`/files/${fileId}/access`).catch(() => {});
  }, [fileId]);

  const checkFilePermission = async (fileId) => {
    try {
      const sharedFiles = await getSharedFiles();
      const sharedFile = sharedFiles.find((item) => item.file?.id === fileId);
      if (sharedFile) {
        setIsSharedFile(true);
        setPermission(sharedFile.permission);
      }
    } catch (error) {
      console.error("Error checking file permission:", error);
    }
  };
  const fetchFileData = async (fileId) => {
    try {
      const url =
        mode === "private"
          ? `https://storage-production-68c6.up.railway.app/api/files/${fileId}/metadata`
          : `https://storage-production-68c6.up.railway.app/api/files/public/${fileId}/metadata`;

      const res = await api.get(url);

      setFile(res.data);
      setLoading(false);
    } catch (error) {
      const status = error?.response?.status;
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to fetch file metadata. Please try again.";

      if (status === 429) {
        toast.error(
          errorMessage || "Too many requests. Please wait and try again.",
        );
      } else if (status === 401) {
        toast.error("Session expired. Please log in again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      } else {
        toast.error(errorMessage);
      }

      setError(error);
      setLoading(false);
      console.error("Error fetching file data:", errorMessage);
    }
  };

  const preventContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  const preventDragStart = (e) => {
    e.preventDefault();
    return false;
  };

  const preventSelection = (e) => {
    e.preventDefault();
    return false;
  };

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return <Image className="w-6 h-6" />;
    if (type.startsWith("video/")) return <Video className="w-6 h-6" />;
    if (type === "application/pdf" || type.startsWith("text/"))
      return <FileText className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const renderFileContent = () => {
    if (!file) return null;

    const commonProps = {
      onContextMenu: preventContextMenu,
      onDragStart: preventDragStart,
      onSelectStart: preventSelection,
      style: { userSelect: "none" },
    };

    if (file.type.startsWith("image/")) {
      return (
        <div className="flex justify-center items-center h-full bg-gradient-to-r from-indigo-100 to-white dark:from-zinc-900 dark:to-zinc-950  rounded-lg">
          <ImageView src={file.url} alt={file.name} zoomOnClick={true} />
        </div>
      );
    }

    if (file.type.startsWith("video/")) {
      return (
        <div className="flex justify-center items-center h-full bg-zinc-50 rounded-lg">
          <video
            src={file.url}
            controls
            className="w-full h-full"
            controlsList="nodownload"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (file.type === "application/pdf") {
      return (
        <div
          className="h-full bg-zinc-50 rounded-lg overflow-auto"
          onContextMenu={(e) => e.preventDefault()}
        >
          <iframe
            src={`${file.url}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-full rounded-lg overflow-auto"
            title={file.name}
            {...commonProps}
          />
        </div>
      );
    }

    if (file.type.startsWith("text/")) {
      return (
        <div className="h-full bg-white rounded-lg border overflow-auto">
          <div className="p-6">
            <iframe
              src={file.url}
              className="w-full h-[80vh] rounded-lg"
              title={file.name}
            />
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="w-6 h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="w-48 h-5 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                  <div className="w-32 h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-full animate-pulse"></div>
                <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-full animate-pulse"></div>
                <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="w-24 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-md animate-pulse mb-4"></div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
            <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
              <div className="w-full max-w-2xl space-y-4 p-8">
                <div className="w-full h-64 bg-zinc-200 dark:bg-zinc-700 rounded-lg animate-pulse"></div>
                <div className="space-y-3">
                  <div className="w-full h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                  <div className="w-3/4 h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                  <div className="w-5/6 h-4 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen  flex items-center justify-center flex-col ">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="gap-2 mb-12"
        >
          <ArrowLeft className="w-4 h-4 " />
          Back
        </Button>
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <File className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-300 mb-2">
            File not found
          </h2>
          <p className="text-zinc-500">
            The file you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen "
      onContextMenu={preventContextMenu}
      style={{ userSelect: "none" }}
    >
      {/* Header */}
      <div className="  sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* File Info */}
            <div className="flex items-center space-x-4">
              <div className="text-blue-600">{getFileIcon(file.type)}</div>
              <div>
                <h1 className="text-lg font-medium text-zinc-900 dark:text-zinc-200 truncate max-w-md">
                  {file.name}
                </h1>
                <p className="text-sm text-zinc-500">
                  {formatDateTime(file.uploadDate, "ago")}
                </p>
              </div>
            </div>

            {file.fileMode === "private" && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() =>
                    (window.location.href = `https://storage-production-68c6.up.railway.app/api/files/${file.id}?action=download`)
                  }
                  className="flex items-center justify-center p-2 text-white bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:rotate-3"
                >
                  <Download className="w-4 h-4" />
                </button>

                {(!isSharedFile || permission === "EDIT") && (
                  <button className="flex items-center justify-center p-2 text-white bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:rotate-3">
                    <Share className="w-4 h-4 " />
                  </button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className=" p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <EllipsisVertical className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 space-y-1">
                    {(!isSharedFile || permission === "EDIT") && (
                      <DropdownMenuItem
                        onClick={() =>
                          handleOpenRenameModalOpen("file", file.id, file.name)
                        }
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      onClick={() => alert(`Details of ${file.name}`)}
                    >
                      <Info className="w-4 h-4 mr-2" />
                      Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {file.fileMode === "private" ? (
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="gap-2 mb-1"
          >
            <ArrowLeft className="w-4 h-4 " />
            Back
          </Button>
        ) : (
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="gap-2 mb-1"
          >
            <ArrowLeft className="w-4 h-4 " />
            Back
          </Button>
        )}
        <div className="bg-white rounded-lg shadow-sm    ">
          <div className="h-[calc(100vh-8rem)]">{renderFileContent()}</div>
        </div>
      </div>
      {isRenameModalOpen && (
        <RenameModal
          renameType={renameType}
          renameValue={renameValue}
          setRenameValue={setRenameValue}
          onClose={() => setIsRenameModalOpen(false)}
          onRenameSubmit={handleRename}
        />
      )}
    </div>
  );
};

export default FileViewer;
