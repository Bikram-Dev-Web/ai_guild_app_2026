import React, { useState } from "react";
import summaryAPI from "../services/summaryAPI";
import articleAPI from "../services/articleAPI";
import SummaryLoader from "./SummaryLoader";
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

interface NewsCardProps {
  article: Article;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const { isAuthenticated } = useAuth();
  const [summary, setSummary] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false); // New state for toggling
  const [summarizing, setSummarizing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

const handleSummarize = async () => {
  // ✅ NEW: check login first
  if (!isAuthenticated) {
    alert("🔒 Please login to generate AI summaries");
    return;
  }

  if (!article.content) {
    alert("Content not available for this article");
    return;
  }

  // If already fetched → toggle
  if (summary) {
    setShowSummary(!showSummary);
    return;
  }

  setSummarizing(true);
  try {
    const result = await summaryAPI.generateSummary(
      article.url,
      article.content,
    );
    setSummary(result.data.summary);
    setShowSummary(true);
  } catch (error: any) {
    alert("Failed to generate summary: " + error.error);
  } finally {
    setSummarizing(false);
  }
};

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      alert("Please login to bookmark articles");
      return;
    }

    setBookmarkLoading(true);
    try {
      await articleAPI.bookmarkArticle(article.id);
      setIsBookmarked(true);
      alert("Article bookmarked!");
    } catch (error: any) {
      if (error.error?.includes("already bookmarked")) {
        setIsBookmarked(true);
      } else {
        alert("Failed to bookmark: " + error.error);
      }
    } finally {
      setBookmarkLoading(false);
    }
  };

  const fallbackImage =
    (import.meta.env.VITE_NEWS_IMAGE_FALLBACK as string) ||
    "https://placehold.co/320x180?text=No+Image";

  return (
    <div className="card flex flex-col h-full">
      {/* Article Image */}
      <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
        <img
          src={article.imageUrl || fallbackImage}
          alt={article.title || "News Article"}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallbackImage;
          }}
        />
        <div className="absolute top-2 right-2">
          <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
            {article.source?.name || "Unknown Source"}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-bold mb-2 text-gray-900 line-clamp-2">
          {article.title || "Untitled Article"}
        </h3>

        <p className="text-sm text-gray-600 mb-2 line-clamp-3">
          {article.description || "No description available"}
        </p>

        {article.author && (
          <p className="text-xs text-gray-500 mb-3">By {article.author}</p>
        )}

        {/* Summary Display - Now checks showSummary as well */}
        {showSummary && summary && (
          <div className="summary-box mb-3">
            <strong className="text-blue-600">✨ Summary:</strong>
            <p className="text-sm mt-1">{summary}</p>
          </div>
        )}

        {summarizing && <SummaryLoader />}

        {/* Card Actions */}
        <div className="flex flex-wrap gap-2 mt-auto pt-3">
          <button
            className="btn btn-primary text-xs"
            onClick={handleSummarize}
            disabled={summarizing}
          >
            {/* Dynamic button text based on state */}
            {summarizing ? "Generating..." : (showSummary ? "Hide Summary" : "Summarize")}
          </button>

          <button
            className={`btn text-xs ${
              isBookmarked ? "btn-secondary" : "btn-outline"
            }`}
            onClick={handleBookmark}
            disabled={bookmarkLoading}
          >
            {bookmarkLoading ? "Saving..." : isBookmarked ? "Saved" : "Save"}
          </button>

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-link text-xs"
          >
            Read Full →
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;