// Feed.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import api from "./api";
import Post from "./Post";
import Stories from "./Stories";
import Logout from "./Logout";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const observerTarget = useRef(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get("/posts");
        setPosts(response.data.data);
        setNextUrl(response.data.links.next);
      } catch (err) {
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const fetchNextPage = useCallback(async () => {
    if (!nextUrl || loadingMore) return;
    setLoadingMore(true);
    try {
      const response = await api.get(nextUrl);
      setPosts((prev) => [...prev, ...response.data.data]);
      setNextUrl(response.data.links.next);
    } catch (err) {
      console.error("Failed to load more posts", err);
    } finally {
      setLoadingMore(false);
    }
  }, [nextUrl, loadingMore]);

  const handleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/likes`);

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== postId) return post;

          return {
            ...post,
            is_liked_by_user: !post.is_liked_by_user,
            likes_count: post.is_liked_by_user
              ? post.likes_count - 1
              : post.likes_count + 1,
          };
        }),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to like post");
    }
  };

  const handleFollow = async (userId) => {
    try {
      await api.post(`/users/${userId}/follow`);

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.author.id !== userId) return post;
          return {
            ...post,
            author: {
              ...post.author,
              is_following: !post.author.is_following,
            },
          };
        }),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to follow user");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;

    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete post");
    }
  };

  const handleUpdatePost = async (postId, updatedData) => {
    try {
      await api.put(`/posts/${postId}`, updatedData);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, ...updatedData } : post,
        ),
      );
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update post");
      return false;
    }
  };

  const handleCommentCreated = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, comments_count: post.comments_count + 1 }
          : post,
      ),
    );
  };

  const handleCommentDeleted = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, comments_count: post.comments_count - 1 }
          : post,
      ),
    );
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [fetchNextPage]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3 z-20">
        <h1 className="text-xl font-serif italic">Postagram</h1>
        <Logout />
      </div>

      <div className="max-w-[470px] mx-auto pt-4">
        <Stories />

        {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            onLike={handleLike}
            onFollow={handleFollow}
            onDelete={handleDeletePost}
            onUpdate={handleUpdatePost}
            onCommentCountUp={handleCommentCreated}
            onCommentCountDown={handleCommentDeleted}
          />
        ))}

        <div
          ref={observerTarget}
          className="h-5 flex items-center justify-center"
        >
          {loadingMore && (
            <p className="text-sm text-gray-400 py-4">Loading more...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Feed;
