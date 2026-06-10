import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./ui/button";

const ViewMorePagination = ({
  currentCount,
  totalCount,
  hasMore,
  loading,
  onLoadMore,
  onShowLess,
  itemName = "items",
}) => {
  if (totalCount === 0) return null;

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="text-sm text-zinc-600 dark:text-zinc-400">
        Showing {currentCount} of {totalCount} {itemName}
      </div>

      <div className="flex gap-3">
        {hasMore && (
          <Button
            onClick={onLoadMore}
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            {loading ? "Loading..." : "View More"}
            <ChevronDown className="w-4 h-4" />
          </Button>
        )}

        {currentCount > 30 && onShowLess && (
          <Button onClick={onShowLess} variant="ghost" className="gap-2">
            Show Less
            <ChevronUp className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ViewMorePagination;
