import React, { useState, useEffect } from "react";
import articleAPI from "../services/articleAPI";
import NewsCard from "../components/NewsCard";
import { useAuth } from "../store/AuthContext";

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

interface Bookmark {
  bookmarkId: string;
  article: Article;
  notes?: string;
}

interface LibraryResponse {
  success: boolean;
  data: {
    bookmarks: Bookmark[];
    pagination?: {
      totalPages: number;
    };
  };
}

const MyLibraryPage: React.FC = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchBookmarks(1);
  }, []);

  const fetchBookmarks = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const result: LibraryResponse = await articleAPI.getUserBookmarks(
        20,
        page,
        "newest",
      );

      if (result.success) {
        setBookmarks(result.data.bookmarks || []);
        setTotalPages(result.data.pagination?.totalPages || 1);
        setCurrentPage(page);
      }
    } catch (err: any) {
      setError(err.error || "Failed to fetch bookmarks");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (bookmarkId: string) => {
    try {
      await articleAPI.removeBookmark(bookmarkId);
      setBookmarks(bookmarks.filter((b) => b.bookmarkId !== bookmarkId));
    } catch (err: any) {
      alert("Failed to remove bookmark: " + err.error);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50">
      {/* Header */}
      <div className="bg-gradient-primary text-rose-500 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold">My Library</h1>
          <p className="text-sm opacity-90 mt-2">
            Welcome, {user?.username || "User"}!
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-4">
            <div className="w-8 h-8 border-4 border-rose-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading bookmarks...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : bookmarks.length > 0 ? (
          <>
            <p className="text-gray-700 font-medium mb-6">
              You have saved {bookmarks.length} articles
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {bookmarks.map((bookmark) => (
                <div key={bookmark.bookmarkId} className="space-y-2">
                  <NewsCard article={bookmark.article} />
                  {bookmark.notes && (
                    <div className="bg-rose-50 border border-rose-200 p-3 rounded-lg">
                      <strong className="text-rose-800 text-sm">
                        Your note:
                      </strong>
                      <p className="text-sm text-rose-700 mt-1">
                        {bookmark.notes}
                      </p>
                    </div>
                  )}
                  <button
                    className="btn btn-secondary w-full"
                    onClick={() => handleRemoveBookmark(bookmark.bookmarkId)}
                  >
                    Remove from Library
                  </button>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={() => fetchBookmarks(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span className="text-gray-700 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => fetchBookmarks(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              You haven't bookmarked any articles yet.
            </p>
            <a
              href="/"
              className="text-rose-600 font-semibold hover:underline mt-2 inline-block"
            >
              Start exploring news
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLibraryPage;
