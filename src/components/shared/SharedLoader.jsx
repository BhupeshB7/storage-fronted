"use client";
import React from "react";

const SharedLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center  backdrop-blur-sm z-50">
      <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent rounded-full animate-spin-smooth"></div>

      {/* Smooth spin animation */}
      <style>{`
        .animate-spin-smooth {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default SharedLoader;
