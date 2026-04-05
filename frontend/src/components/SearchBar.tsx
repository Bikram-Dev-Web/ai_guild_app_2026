import React, { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setQuery("");
    }
  };

  return (
    <form className="mb-6" onSubmit={handleSubmit}>
      <div className="flex gap-3 max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="Search news articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-4 py-3 border-2 border-rose-200 rounded-full focus:outline-none focus:border-rose-400 disabled:bg-rose-50 bg-white"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
