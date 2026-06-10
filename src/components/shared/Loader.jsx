"use client";
import React from "react";

const SharedLoader = ({ fullScreen = false }) => {
  return (
    <div
      className={`w-full h-full grid place-items-center ${
        fullScreen ? "fixed inset-0 z-50 backdrop-blur-sm" : ""
      }`}
    >
      <div className="w-10 h-10 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin-smooth"></div>

      <style>{`
        .animate-spin-smooth {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SharedLoader;
