import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import newsAPI from "../services/newsAPI";
import NewsCard from "../components/NewsCard";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  imageUrl: string;
  author?: string;
  source?: { id?: string; name: string };
}

interface NewsResponse {
  success: boolean;
  data: {
    articles: Article[];
    pagination?: {
      totalPages: number;
    };
  };
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [searchMode, setSearchMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchHeadlines(selectedCategory, 1);
  }, [selectedCategory]);

  const fetchHeadlines = async (category: string, page: number) => {
    setLoading(true);
    setError(null);

    try {
      const result: NewsResponse = await newsAPI.getHeadlines(
        category,
        20,
        page,
      );

      if (result.success) {
        setArticles(result.data.articles || []);
        setTotalPages(result.data.pagination?.totalPages || 1);
        setCurrentPage(page);
        setSearchMode(false);
      }
    } catch (err: any) {
      setError(err.error || "Failed to fetch news");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const result: NewsResponse = await newsAPI.searchArticles(query, 20, 1);

      if (result.success) {
        setArticles(result.data.articles || []);
        setTotalPages(result.data.pagination?.totalPages || 1);
        setCurrentPage(1);
        setSearchMode(true);
      }
    } catch (err: any) {
      setError(err.error || "Search failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const goToPage = (page: number) => {
    if (searchMode) {
      handleSearch(selectedCategory);
    } else {
      fetchHeadlines(selectedCategory, page);
    }
  };

  const handleLogin = () => navigate("/login");
  const handleSignup = () => navigate("/signup");
  const handleMyLibrary = () => navigate("/library");
  const handleProfile = () => navigate("/profile");
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-rose-50">
      {/* Header */}
      <div className="bg-gradient-primary text-rose-600 py-6 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <div className="text-left">
            <h1 className="text-3xl font-bold">NovaNews</h1>
            <p className="text-sm opacity-90">AI-Enhanced News Portal</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm opacity-90">
                  Welcome, {user?.username || user?.email}!
                </span>
                <button
                  className="btn btn-outline text-sm"
                  onClick={handleMyLibrary}
                >
                  My Library
                </button>
                <button
                  className="btn btn-outline text-sm"
                  onClick={handleProfile}
                >
                  Profile
                </button>
                <button
                  className="btn btn-secondary text-sm"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  className="btn btn-outline text-sm"
                  onClick={handleLogin}
                >
                  Login
                </button>
                <button
                  className="btn btn-primary text-sm"
                  onClick={handleSignup}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Section */}
        <SearchBar onSearch={handleSearch} isLoading={loading} />

        {/* Category Filter */}
        <CategoryFilter
          onCategoryChange={handleCategoryChange}
          isLoading={loading}
        />

        {/* Error Message */}
        {error && (
          <div className="error-message mb-6 max-w-2xl mx-auto">{error}</div>
        )}

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {articles.map((article) => (
                <NewsCard key={article.url} article={article} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                <span className="text-gray-700 font-medium">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No articles found. Try a different search or category.
            </p>
          </div>
        ) : null}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading articles...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
