import React from "react";
import { Link } from "react-router-dom";
import { LayoutList, LayoutGrid } from "lucide-react";
import { useLayoutStore } from "@/store/useLayoutStore";
import getFileIcon from "@/utils/getFileIcon";

const FileBrowser = ({ files, renderActions }) => {
  const { layout, setLayout } = useLayoutStore();

  if (!files || files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-32 h-32 bg-[var(--surface-variant)] rounded-full flex items-center justify-center mb-6">
          <LayoutList className="w-16 h-16 text-gray-400" />
        </div>
        <p className="text-[var(--muted-foreground)] text-center max-w-md mb-8">
          No files available. Upload files to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Toggle Button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-[var(--foreground)]">
          Files
        </h3>
        <div className="flex gap-2 bg-gray-100 dark:bg-zinc-900 p-2 rounded-lg">
          <button
            onClick={() => setLayout("list")}
            className={`p-2 rounded-lg ${
              layout === "list"
                ? "bg-blue-500 text-white shadow-md"
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <LayoutList className="w-5 h-5" />
          </button>
          <button
            onClick={() => setLayout("grid")}
            className={`p-2 rounded-lg ${
              layout === "grid"
                ? "bg-blue-500 text-white shadow-md"
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* File Rendering */}
      <div
        className={
          layout === "grid"
            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            : "space-y-2"
        }
      >
        {files.map((file) => (
          <div
            key={file._id}
            className={`border border-[var(--border)] rounded-lg bg-[var(--card)] hover:bg-[var(--surface-variant)] transition-colors duration-200 
              ${layout === "grid" ? "p-4 flex flex-col items-center" : "p-4 flex items-center gap-3"}
            `}
          >
            <Link
              to={`/file/${file._id}`}
              className={`flex-1 ${layout === "grid" ? "flex flex-col items-center" : "flex items-center gap-3"}`}
            >
              <div
                className={`${
                  layout === "grid" ? "mb-2" : ""
                } text-gray-500 flex-shrink-0`}
              >
                {getFileIcon(file.name, layout === "grid" ? 40 : 24)}
              </div>
              <div
                className={`${
                  layout === "grid" ? "text-center" : "flex flex-col"
                }`}
              >
                <p className="font-medium text-[var(--foreground)] truncate">
                  {file.name}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {file.extension}
                </p>
              </div>
            </Link>

            {/* Context-specific actions */}
            {renderActions && (
              <div className="absolute top-3 right-3">
                {renderActions(file)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileBrowser;
