import { api } from "@/api/fileDirectoryApi";
import axios from "axios";
import { UploadCloud, X, CheckCircle2, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

const FileUpload = ({ parentDirId, onUploadSuccess, onModalStateChange }) => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle");
  useEffect(() => {
    if (onModalStateChange) {
      onModalStateChange(showModal);
    }
  }, [showModal]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleUploadFile = async () => {
    if (!file) {
      toast.warning("Please select a file");
      return;
    }

    setUploadStatus("uploading");
    setProgress(0);

    try {
      const initiateRes = await api.post("/files/upload/initiate", {
        parentDirId,
        name: file.name,
        size: file.size,
        type: file.type,
      });

      const { uploadSignedUrl, fileId } = initiateRes.data;

      await axios.put(uploadSignedUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percent);
        },
      });
      await api.post("/files/upload/complete", { fileId });
      setUploadStatus("success");
      toast.success("File uploaded successfully");

      if (onUploadSuccess) {
        await onUploadSuccess();
      }

      setTimeout(() => {
        setFile(null);
        setProgress(0);
        setUploadStatus("idle");
        setShowModal(false);
      }, 1000);
    } catch (error) {
      setUploadStatus("error");

      const status = error?.response?.status;
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to upload file. Please try again later.";

      if (status === 429) {
        toast.error(errorMessage);
      } else if (status === 401) {
        toast.error("Session expired. Please log in again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleCancel = () => {
    setFile(null);
    setProgress(0);
    setUploadStatus("idle");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    handleCancel();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Enhanced Progress Bar Component
  const ProgressBar = () => {
    const circumference = 2 * Math.PI * 45;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative w-full">
        {/* Linear Progress Bar */}
        <div className="relative w-full h-3 bg-gradient-to-r from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 rounded-full overflow-hidden shadow-inner">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out shadow-lg"
            style={{
              width: `${progress}%`,
              boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
            }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-pulse"></div>
          </div>

          {/* Glowing dots animation */}
          <div className="absolute inset-0 flex items-center">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-1 bg-white/40 rounded-full mx-1 animate-pulse"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  opacity: progress > i * 5 ? 1 : 0.3,
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Progress Info */}
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center gap-3">
            {/* Circular Progress Indicator */}
            <div className="relative w-12 h-12">
              <svg
                className="w-12 h-12 transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-zinc-200 dark:text-zinc-700"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#gradient)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 ease-out"
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {uploadStatus === "success" ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : uploadStatus === "uploading" ? (
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    {progress}%
                  </span>
                ) : (
                  <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
                )}
              </div>
            </div>

            {/* Status Text */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                {uploadStatus === "uploading"
                  ? "Uploading..."
                  : uploadStatus === "success"
                  ? "Upload Complete!"
                  : "Preparing upload..."}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {progress > 0 &&
                  `${progress}% • ${formatFileSize(
                    file?.size * (progress / 100) || 0
                  )} of ${formatFileSize(file?.size || 0)}`}
              </p>
            </div>
          </div>

          {/* Speed and Time Estimate */}
          <div className="text-right space-y-1">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {uploadStatus === "uploading" ? "~2.3 MB/s" : ""}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {uploadStatus === "uploading" && progress < 100
                ? `${Math.max(1, Math.ceil((100 - progress) / 10))}s remaining`
                : ""}
            </p>
          </div>
        </div>

        {/* Particle Effects */}
        {uploadStatus === "success" && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1s",
                }}
              ></div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Modal Component
  const Modal = () => (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        pointerEvents: "auto",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && uploadStatus !== "uploading") {
          handleCloseModal();
        }
      }}
    >
      <div
        className="relative space-y-6 w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl transition-all duration-300 transform"
        onClick={(e) => e.stopPropagation()}
      >
        {uploadStatus !== "uploading" && (
          <button
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full transition-all duration-200 hover:scale-110"
            onClick={handleCloseModal}
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Upload File
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Select a file to upload to your storage
          </p>
        </div>

        {uploadStatus === "idle" && (
          <div className="relative">
            <input
              type="file"
              id="file-upload-input"
              onChange={(e) => setFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              accept="*/*"
            />
            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-400 transition-all duration-200 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/10">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                <UploadCloud className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
                Drop your file here
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                or click to browse from your device
              </p>
            </div>
          </div>
        )}

        {/* File Preview */}
        {file && uploadStatus === "idle" && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {file.name.split(".").pop()?.toUpperCase() || "FILE"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancel}
                className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Progress Section */}
        {(uploadStatus === "uploading" || uploadStatus === "success") && (
          <div className="space-y-4">
            <ProgressBar />
          </div>
        )}

        {/* Action Buttons */}
        {uploadStatus === "idle" && (
          <div className="flex gap-3">
            <button
              onClick={handleCloseModal}
              className="flex-1 px-4 py-3 text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleUploadFile}
              disabled={!file}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-zinc-400 disabled:to-zinc-400 font-medium shadow-lg hover:shadow-xl"
            >
              <UploadCloud className="w-5 h-5" />
              Upload File
            </button>
          </div>
        )}

        {uploadStatus === "success" && (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-lg font-medium text-green-600 dark:text-green-400">
              Upload Successful!
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Your file has been uploaded successfully
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <button
        onClick={handleOpenModal}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <UploadCloud className="w-5 h-5" />
        Upload File
      </button>

      {showModal && createPortal(<Modal />, document.body)}
    </div>
  );
};

export default FileUpload;
