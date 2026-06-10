const FileCardSkeleton = ({ layout = "grid" }) => {
  if (layout === "grid") {
    return (
      <div className="relative w-full flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 overflow-hidden animate-pulse">
        <div className="w-full h-44 bg-zinc-200 dark:bg-zinc-700"></div>

        <div className="w-full p-4 space-y-2">
          <div className="w-full h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
          <div className="w-3/4 h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>

          <div className="flex items-center gap-2 pt-1">
            <div className="w-12 h-5 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
            <div className="w-16 h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
            <div className="w-20 h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
          </div>
        </div>

        <div className="w-full px-4 pb-4 border-t border-zinc-200 dark:border-zinc-700 pt-3">
          <div className="flex items-center justify-center w-full gap-2">
            <div className="flex-1 h-9 bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
            <div className="flex-1 h-9 bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 animate-pulse">
      <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded mr-4"></div>

      <div className="flex flex-col flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-48 h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
          <div className="w-12 h-5 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-3 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
          <div className="w-24 h-3 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
          <div className="w-28 h-3 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-4">
        <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
        <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
        <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
      </div>
    </div>
  );
};

export default FileCardSkeleton;
