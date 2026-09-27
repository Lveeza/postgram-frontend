import { useState, useEffect } from "react";
import api from "./api";
import Post from "./Post";
import Header from "./Header";

function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true); // we fetch on mount now
  const [error, setError] = useState("");

  const [selectedPostIndex, setSelectedPostIndex] = useState(null);

  // load all posts once when the page opens
  useEffect(() => {
    const fetchAllPosts = async () => {
      setLoading(true);
      try {
        const response = await api.get("/posts");
        setResults(response.data.data);
        setError("");
      } catch (err) {
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };
    fetchAllPosts();
  }, []);

  //  when query is empty, do nothing here —
  useEffect(() => {
    if (query.trim() === "") {
      return;
    }

    setLoading(true);

    const timerId = setTimeout(async () => {
      try {
        const response = await api.get(`/posts?search=${query}`);
        setResults(response.data.data);
        setError("");
      } catch (err) {
        setError("Failed to search posts");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timerId);
  }, [query]);

  const handleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/likes`);
      setResults((prev) =>
        prev.map((p) =>
          p.id !== postId
            ? p
            : {
                ...p,
                is_liked_by_user: !p.is_liked_by_user,
                likes_count: p.is_liked_by_user
                  ? p.likes_count - 1
                  : p.likes_count + 1,
              },
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollow = async (authorId) => {
    try {
      await api.post(`/users/${authorId}/follow`);
      setResults((prev) =>
        prev.map((p) =>
          p.author.id !== authorId
            ? p
            : {
                ...p,
                author: { ...p.author, is_following: !p.author.is_following },
              },
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.delete(`/posts/${postId}`);
      setResults((prev) => prev.filter((p) => p.id !== postId));
      setSelectedPostIndex(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePost = async (postId, updatedData) => {
    try {
      await api.put(`/posts/${postId}`, updatedData);
      setResults((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, ...updatedData } : p)),
      );
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleCommentCountUp = (postId) => {
    setResults((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p,
      ),
    );
  };

  const handleCommentCountDown = (postId) => {
    setResults((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments_count: p.comments_count - 1 } : p,
      ),
    );
  };

  const selectedPost =
    selectedPostIndex !== null ? results[selectedPostIndex] : null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <div className="max-w-[600px] mx-auto pt-4 px-4">
        <div className="sticky top-0 bg-gray-50 pt-2 pb-3 z-10">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 fill-none stroke-gray-400 stroke-2 shrink-0"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts..."
              className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-gray-400 text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {loading && (
          <p className="text-center text-gray-400 text-sm py-6">Loading...</p>
        )}

        {error && (
          <p className="text-center text-red-500 text-sm py-6">{error}</p>
        )}

        {!loading && !error && results.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">
            {query.trim() === ""
              ? "No posts yet."
              : `No posts found for "${query}"`}
          </p>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-3 gap-1 pb-10">
            {results.map((post, index) => {
              const thumb = post.media?.[0];
              return (
                <button
                  key={post.id}
                  onClick={() => setSelectedPostIndex(index)}
                  className="relative aspect-square bg-gray-200 overflow-hidden"
                >
                  {thumb?.type === "image" && (
                    <img
                      src={thumb.content}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {thumb?.type === "video" && (
                    <>
                      <video
                        src={thumb.content}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1.5 right-1.5 text-white text-xs">
                        ▶
                      </span>
                    </>
                  )}
                  {(!thumb || thumb.type === "text") && (
                    <div className="w-full h-full flex items-center justify-center p-2 text-center text-xs text-gray-500 bg-gray-100">
                      {post.title || thumb?.content || "Text post"}
                    </div>
                  )}
                  {post.media?.length > 1 && (
                    <span className="absolute top-1.5 right-1.5 text-white text-xs drop-shadow">
                      ⧉
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedPost && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setSelectedPostIndex(null)}
        >
          <div
            className="max-w-[470px] w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setSelectedPostIndex(null)}
                className="text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <Post
              post={selectedPost}
              onLike={handleLike}
              onFollow={handleFollow}
              onDelete={handleDeletePost}
              onUpdate={handleUpdatePost}
              onCommentCountUp={handleCommentCountUp}
              onCommentCountDown={handleCommentCountDown}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;
