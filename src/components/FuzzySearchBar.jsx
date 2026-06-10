import Fuse from "fuse.js";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { File, Folder, Search, X, XCircle } from "lucide-react";
import { fetchSearchResults } from "@/api/fileDirectoryApi";

const FuzzySearchBar = () => {
  const [allData, setAllData] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetchSearchResults();
      setAllData(response);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  const fuse = useMemo(() => {
    return new Fuse(allData, {
      keys: ["name"],
      threshold: 0.4,
    });
  }, [allData]);

  useEffect(() => {
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }
    const fuseResults = fuse.search(query).map((result) => result.item);
    setSearchResults(fuseResults);
  }, [query, fuse]);

  const handleClick = (item) => {
    if (item.type === "file") {
      navigate(`/file/${item._id}`);
    } else {
      navigate(`/directory/${item._id}`);
    }
    setQuery("");
    setSearchResults([]);
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const getIcon = (type) =>
    type === "file" ? (
      <File className="w-5 h-5 text-blue-500 dark:text-blue-400" />
    ) : (
      <Folder className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
    );

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search files or folders..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-4 pr-10 border border-gray-300 dark:border-zinc-700 
                     rounded-full bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-100 
                     placeholder:text-gray-400 dark:placeholder:text-zinc-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     shadow-sm transition-all"
        />
        {!query && (
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
        )}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 
                       text-gray-500 dark:text-zinc-400 hover:text-red-500 transition-colors"
          >
            <X />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {query.trim() !== "" && (
        <div
          className="absolute top-full left-0 right-0 mt-2 
                        bg-white dark:bg-zinc-900 
                         z-50 max-h-90 overflow-y-auto 
                        shadow-lg border border-gray-200 dark:border-zinc-800 animate-in fade-in-50"
        >
          {searchResults.length > 0 ? (
            searchResults.map((item) => (
              <div
                key={item._id}
                onClick={() => handleClick(item)}
                tabIndex={0}
                className="px-4 py-2 cursor-pointer 
                           hover:bg-gray-50 dark:hover:bg-zinc-800 
                           transition-colors border-b border-gray-100 dark:border-zinc-800 
                           last:border-b-0"
              >
                <div className="flex items-center gap-2 text-gray-900 dark:text-zinc-100 font-medium">
                  {getIcon(item.type)}
                  <span>{item.name}</span>
                </div>
              </div>
            ))
          ) : (
            <div
              className="p-6 text-center bg-gray-50 dark:bg-zinc-900 
                            border border-dashed border-gray-300 dark:border-zinc-700 
                             flex flex-col items-center gap-2"
            >
              <XCircle className="w-8 h-8 text-red-400 dark:text-red-300" />
              <p className="text-lg font-semibold text-gray-700 dark:text-zinc-200">
                No results found
              </p>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Try a different keyword or check your spelling.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FuzzySearchBar;
