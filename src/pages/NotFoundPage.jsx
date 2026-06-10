import React, { useState, useEffect } from "react";
import { Cloud, CloudOff, ArrowLeft, Home, FileX } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsRedirecting(true);
          setTimeout(() => {
            navigate("/");
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoHome = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      navigate("/");
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 transition-all duration-500">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div
          className={`max-w-md w-full text-center transition-all duration-700 ${
            isRedirecting ? "scale-95 opacity-70" : "scale-100 opacity-100"
          }`}
        >
          {/* Floating Cloud Animation */}
          <div className="relative mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white dark:bg-zinc-800 shadow-xl dark:shadow-zinc-900/50 shadow-black/10 transition-all duration-500">
              <CloudOff className="w-12 h-12 text-gray-500 dark:text-zinc-400 transition-all duration-300" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <FileX className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* 404 Text */}
          <div className="mb-6">
            <h1 className="text-8xl font-bold mb-2 bg-gradient-to-r from-gray-700 to-gray-900 dark:from-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent transition-all duration-500">
              404
            </h1>
            <div className="h-1 w-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"></div>
          </div>

          {/* Error Message */}
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-zinc-200 transition-colors duration-500">
            Page Not Found
          </h2>
          <p className="text-lg mb-8 leading-relaxed text-gray-600 dark:text-zinc-400 transition-colors duration-500">
            The file or folder you're looking for seems to have vanished into
            the cloud. Don't worry, we'll take you back home.
          </p>

          {/* Countdown Timer */}
          <div className="mb-8 p-6 rounded-2xl bg-white/70 dark:bg-zinc-800/50 border border-gray-200/50 dark:border-zinc-700/50 backdrop-blur-sm shadow-lg dark:shadow-none transition-all duration-500">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Home className="w-5 h-5 text-gray-600 dark:text-zinc-400 transition-colors duration-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-zinc-400 transition-colors duration-500">
                Redirecting to home
              </span>
            </div>

            <div className="flex items-center justify-center gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 ${
                  countdown <= 1 ? "animate-pulse scale-110" : ""
                } transition-all duration-300`}
              >
                {countdown}
              </div>
              <span className="text-lg text-gray-700 dark:text-zinc-300 transition-colors duration-500">
                second{countdown !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-700 transition-all duration-500">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-linear"
                style={{ width: `${((10 - countdown) / 10) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Manual Navigation Button */}
          <button
            onClick={handleGoHome}
            disabled={isRedirecting}
            className="group px-8 py-4 rounded-xl font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
              <span>{isRedirecting ? "Redirecting..." : "Go Home Now"}</span>
            </div>
          </button>

          {/* Floating Elements */}
          <div className="absolute top-10 left-10 opacity-20">
            <Cloud className="w-8 h-8 animate-pulse text-gray-300 dark:text-zinc-600" />
          </div>
          <div className="absolute bottom-20 right-10 opacity-20">
            <Cloud className="w-6 h-6 animate-pulse delay-1000 text-gray-300 dark:text-zinc-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
