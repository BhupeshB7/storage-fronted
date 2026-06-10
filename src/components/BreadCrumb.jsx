import React, { useState, useEffect } from "react";
import { Home, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getBreadcrumbPath } from "@/api/fileDirectoryApi";

const Breadcrumb = ({ currentDirId }) => {
  const [path, setPath] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentDirId) fetchPath();
    else setPath([]);
  }, [currentDirId]);

  const fetchPath = async () => {
    setLoading(true);
    const breadcrumb = await getBreadcrumbPath(currentDirId);
    setPath(breadcrumb || []);
    setLoading(false);
  };

  const handleNavigate = (dirId) => {
    if (dirId === "root") navigate("/");
    else navigate(`/directory/${dirId}`);
  };

  const formatName = (name) => {
    if (!name) return "Untitled";
    if (name.includes("root-") && name.includes("@")) return "Home";
    return name;
  };

  const isHome = !currentDirId || currentDirId === "root";

  if (loading) {
    return (
      <div className="px-6 py-4">
        <div className="h-9 w-72  animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className="
        px-6 py-3
        max-w-[calc(100vw-250px)]
        md:max-w-[calc(100vw-250px)]
         max-w-full
      "
    >
      <nav
        aria-label="Breadcrumb"
        className="
          flex flex-wrap items-center gap-y-2 gap-x-1
          backdrop-blur-xl
          px-3 py-2
        "
      >
        <button
          onClick={() => handleNavigate("root")}
          disabled={isHome}
          className={`
            inline-flex items-center gap-2
              px-3 py-1.5 text-sm font-medium
            transition-all duration-200
            ${
              isHome
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            }
          `}
        >
          <Home size={16} />
          <span>Home</span>
        </button>

        {path.map((dir, index) => {
          const isLast = index === path.length - 1;
          const isRootDir =
            dir.name?.includes("root-") && dir.name?.includes("@");

          if (isRootDir) return null;

          return (
            <React.Fragment key={dir._id}>
              <ChevronRight
                size={14}
                className="mx-1 text-zinc-400 dark:text-zinc-600"
              />

              <button
                onClick={() => !isLast && handleNavigate(dir._id)}
                disabled={isLast}
                title={dir.name}
                className={`
                  max-w-[220px] truncate
                    px-3 py-1.5 text-sm font-medium
                  transition-all duration-200
                  ${
                    isLast
                      ? "bg-zinc-100 text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  }
                `}
              >
                {formatName(dir.name)}
              </button>
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
};

export default Breadcrumb;
