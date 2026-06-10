import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatFileSize,
  formatTimeAgo,
  getFileIconComponent,
  getFileType,
} from "@/utils/fileHelpers";

import {
  Calendar,
  Check,
  Clock,
  Download,
  EllipsisVertical,
  FileText,
  Image,
  Info,
  Link2,
  Pencil,
  Share2,
  Star,
  Trash2,
  Video,
} from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { Link } from "react-router-dom";

const FileItem = ({
  file,
  layout = "list",
  isSelectionMode = false,
  isSelected = false,
  canSelectItem = true,
  onToggleSelection = () => {},
  onRename = () => {},
  onDelete = () => {},
  onStar = () => {},
  onShowDetails = () => {},
  onCopyLink = () => {},
  onEnterSelectionMode = () => {},
  setShareModalOpen = () => {},
  setManageShareModalOpen = () => {},
  setSelectedFile = () => {},
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [previewError, setPreviewError] = useState(false);

  const handleClick = (e) => {
    if (isSelectionMode && canSelectItem) {
      e.preventDefault();
      onToggleSelection();
    }
  };

  const handleDownload = () => {
    window.location.href = `http://localhost:3000/api/files/${file._id}?action=download`;
  };

  const truncateFileName = (name, maxLength = 24) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + "...";
  };

  const fileIcon = getFileIconComponent(
    file.name,
    layout === "grid" ? "large" : "default",
  );

  const timeAgo = formatTimeAgo(file.createdAt || file.updatedAt);
  const fileSize = file.size ? formatFileSize(file.size) : null;

  const renderFilePreview = () => {
    const fileType = getFileType(file.name);
    const fileUrl = file.url || `http://localhost:3000/api/files/${file._id}`;

    if (fileType === "image") {
      return (
        <div className="w-full h-full relative">
          {imageLoading && (
            <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-700 animate-pulse flex items-center justify-center">
              <Image className="w-8 h-8 text-zinc-400 animate-pulse" />
            </div>
          )}
          <img
            src={fileUrl}
            alt={file.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              setImageLoading(false);
              setPreviewError(true);
              e.target.style.display = "none";
            }}
          />
          {previewError && (
            <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
              {fileIcon}
            </div>
          )}
        </div>
      );
    }

    if (fileType === "document" && file.extension === "pdf") {
      return (
        <div className="w-full h-full relative bg-white dark:bg-zinc-900">
          <object
            data={fileUrl}
            type="application/pdf"
            className="w-full h-full pointer-events-none"
            aria-label={file.name}
          >
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-white dark:from-zinc-800 dark:to-zinc-900 p-4">
              <FileText className="w-16 h-16 text-red-500 mb-3" />
              <div className="text-xs text-zinc-600 dark:text-zinc-400 text-center line-clamp-2">
                PDF Document
              </div>
            </div>
          </object>
        </div>
      );
    }

    if (fileType === "document") {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white dark:from-zinc-800 dark:to-zinc-900 p-4">
          <FileText className="w-16 h-16 text-blue-500 mb-3" />
          <div className="text-xs text-zinc-600 dark:text-zinc-400 text-center line-clamp-2">
            {file.extension?.toUpperCase()} Document
          </div>
        </div>
      );
    }

    if (fileType === "video") {
      return (
        <div className="w-full h-full relative bg-black">
          {imageLoading && (
            <div className="absolute inset-0 bg-zinc-800 animate-pulse flex items-center justify-center">
              <Video className="w-8 h-8 text-zinc-400 animate-pulse" />
            </div>
          )}
          <video
            src={fileUrl}
            className="w-full h-full object-cover"
            preload="metadata"
            onLoadedMetadata={() => setImageLoading(false)}
            onError={() => {
              setImageLoading(false);
              setPreviewError(true);
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
            <Video className="w-12 h-12 text-white" />
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-800">
        {fileIcon}
      </div>
    );
  };

  const renderGridLayout = () => (
    <div
      className={`relative group w-full flex flex-col rounded-xl border transition-all duration-300 overflow-hidden ${
        isSelected
          ? "ring-4 ring-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
          : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-600"
      } ${isSelectionMode && !canSelectItem ? "opacity-50 cursor-not-allowed" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isSelectionMode && canSelectItem && (
        <div className="absolute top-3 left-3 z-20">
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md ${
              isSelected
                ? "bg-blue-500 border-blue-500 scale-110"
                : "bg-white/90 dark:bg-zinc-800/90 border-zinc-300 dark:border-zinc-600 group-hover:border-blue-300"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelection();
            }}
          >
            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
          </div>
        </div>
      )}

      <div className="absolute top-3 right-3 z-10">
        {!isSelectionMode && (
          <FileDropdown
            file={file}
            onRename={onRename}
            onDelete={() => setDeleteDialogOpen(true)}
            onStar={onStar}
            onShowDetails={onShowDetails}
            onCopyLink={onCopyLink}
            onDownload={handleDownload}
            onEnterSelectionMode={onEnterSelectionMode}
            setShareModalOpen={setShareModalOpen}
            setManageShareModalOpen={setManageShareModalOpen}
            setSelectedFile={setSelectedFile}
            layout="grid"
          />
        )}
      </div>

      {file.isStarred && !isSelectionMode && (
        <div className="absolute top-3 left-3 z-10 bg-yellow-400 dark:bg-yellow-500 rounded-full p-1.5 shadow-md">
          <Star className="w-3 h-3 text-white fill-white" />
        </div>
      )}

      {file.isStarred && isSelectionMode && (
        <div className="absolute top-3 left-12 z-10 bg-yellow-400 dark:bg-yellow-500 rounded-full p-1.5 shadow-md">
          <Star className="w-3 h-3 text-white fill-white" />
        </div>
      )}

      <Link
        to={`/file/${file._id}`}
        className={`flex flex-col w-full ${
          isSelectionMode ? "pointer-events-none" : ""
        }`}
        onClick={handleClick}
      >
        <div className="w-full h-44 bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
          {renderFilePreview()}
        </div>

        <div className="w-full p-4 space-y-2">
          <h3 className="font-medium text-zinc-900 dark:text-zinc-50 text-sm leading-snug line-clamp-2">
            {file.name}
          </h3>

          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-medium px-2 py-0.5 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded">
              {file.extension?.toUpperCase() || "FILE"}
            </span>
            {fileSize && (
              <>
                <span className="text-zinc-300 dark:text-zinc-600">•</span>
                <span>{fileSize}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <Clock className="w-3 h-3" />
            <span>{timeAgo}</span>
          </div>
        </div>
      </Link>

      <div className="w-full px-4 pb-4 border-t border-zinc-100 dark:border-zinc-700 pt-3">
        <div className="flex items-center justify-center w-full gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center justify-center gap-1.5 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            onClick={onStar}
            className={`flex-1 text-xs flex items-center justify-center gap-1.5 transition-colors px-3 py-2 rounded-lg font-medium ${
              file.isStarred
                ? "text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${file.isStarred ? "fill-yellow-500" : ""}`}
            />
            <span className="hidden sm:inline">
              {file.isStarred ? "Starred" : "Star"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderListLayout = () => (
    <div
      className={`flex items-center p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-colors duration-200 ${
        isSelected ? "ring-1 ring-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""
      } ${isSelectionMode && !canSelectItem ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={handleClick}
    >
      {isSelectionMode && canSelectItem && (
        <div className="mr-4">
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${
              isSelected
                ? "bg-blue-500 border-blue-500"
                : "bg-white border-zinc-300 dark:bg-zinc-800 dark:border-zinc-600"
            }`}
          >
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
      )}

      <Link
        to={`/file/${file._id}`}
        className={`flex items-center flex-1 ${
          isSelectionMode ? "pointer-events-none" : ""
        }`}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="relative">
            {fileIcon}
            {file.isStarred && (
              <div className="absolute -top-1 -right-1 bg-yellow-100 dark:bg-yellow-900 rounded-full p-0.5">
                <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-zinc-800 dark:text-zinc-100 truncate">
                {file.name}
              </h3>
              <span className="text-xs font-medium px-2 py-0.5 bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full">
                {file.extension?.toUpperCase() || "FILE"}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              {fileSize && (
                <span className="flex items-center gap-1">{fileSize}</span>
              )}

              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </span>

              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {moment(file.createdAt).format("MMM D, YYYY")}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {!isSelectionMode && (
        <div className="flex items-center gap-3 ml-4">
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onStar}
              className={`text-xs flex items-center gap-1 transition-colors px-2 py-1 rounded ${
                file.isStarred
                  ? "text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${file.isStarred ? "fill-yellow-500" : ""}`}
              />
            </button>
          </div>

          <FileDropdown
            file={file}
            onRename={onRename}
            onDelete={() => setDeleteDialogOpen(true)}
            onStar={onStar}
            onShowDetails={onShowDetails}
            onCopyLink={onCopyLink}
            onDownload={handleDownload}
            onEnterSelectionMode={onEnterSelectionMode}
            setShareModalOpen={setShareModalOpen}
            setManageShareModalOpen={setManageShareModalOpen}
            setSelectedFile={setSelectedFile}
            layout="list"
          />
        </div>
      )}
    </div>
  );

  return (
    <>
      {layout === "grid" ? renderGridLayout() : renderListLayout()}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <b>{file.name}</b>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete();
                setDeleteDialogOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const FileDropdown = ({
  file,
  onRename,
  onDelete,
  onStar,
  onShowDetails,
  onCopyLink,
  onDownload,
  onEnterSelectionMode,
  setShareModalOpen,
  setManageShareModalOpen,
  setSelectedFile,
  layout = "list",
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors ${
            layout === "grid"
              ? "bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm shadow-sm"
              : ""
          }`}
        >
          <EllipsisVertical className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={layout === "grid" ? "start" : "end"}
        className="w-48"
      >
        <DropdownMenuItem onClick={onEnterSelectionMode}>
          <Check className="w-4 h-4 mr-2" />
          Select
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onRename}>
          <Pencil className="w-4 h-4 mr-2" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onShowDetails}>
          <Info className="w-4 h-4 mr-2" />
          Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onStar}>
          <Star
            className={`w-4 h-4 mr-2 ${
              file.isStarred
                ? "text-yellow-500 fill-yellow-500"
                : "text-zinc-500"
            }`}
          />
          {file.isStarred ? "Remove from Starred" : "Add to Starred"}
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem
              onClick={() => {
                setSelectedFile(file);
                setShareModalOpen(true);
              }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share with user
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedFile(file);
                setManageShareModalOpen(true);
              }}
            >
              <Info className="w-4 h-4 mr-2" />
              Manage access
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCopyLink}>
              <Link2 className="w-4 h-4 mr-2" />
              Copy Link
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={onDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDelete} className="text-red-600">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FileItem;
