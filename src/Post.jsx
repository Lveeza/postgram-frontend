import { useState } from "react";
import api from "./api";
import CreateComment from "./CreateComment";
import { Link } from "react-router-dom";

function HeartIcon({ filled }) {
  return filled ? (
    <svg viewBox="0 0 24 24" class="w-6 h-6 fill-red-500">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6 fill-none stroke-black stroke-2"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6 fill-none stroke-black stroke-2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function Post({
  post,
  onLike,
  onFollow,
  onDelete,
  onUpdate,
  onCommentCountUp,
  onCommentCountDown,
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editBody, setEditBody] = useState(post.body);
  const [menuOpen, setMenuOpen] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  const currentMedia = post.media[currentMediaIndex];

  const currentUserId = Number(localStorage.getItem("userId"));
  const isOwner = post.author.id === currentUserId;

  const toggleComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }

    setLoadingComments(true);
    try {
      const response = await api.get(`/posts/${post.id}/comments`);
      setComments(response.data.data);
      setShowComments(true);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const nextMedia = () => {
    if (currentMediaIndex < post.media.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
  };

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  };

  const handleCommentCreated = (newComment) => {
    setComments((prevComments) => [...prevComments, newComment]);
    onCommentCountUp(post.id);
  };

  const handleCommentDelete = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prevComments) =>
        prevComments.filter((c) => c.id !== commentId),
      );
      onCommentCountDown(post.id);
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  const handleCommentUpdate = async (commentId) => {
    try {
      await api.put(`/comments/${commentId}`, {
        content: editCommentContent,
      });
      setComments((prevComments) =>
        prevComments.map((c) =>
          c.id === commentId ? { ...c, content: editCommentContent } : c,
        ),
      );
      setEditingCommentId(null);
    } catch (err) {
      console.error("Failed to update comment", err);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2 text-sm">
          {post.author.avatar_url && (
            <img
              src={post.author.avatar_url}
              alt={post.author.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <Link to={`/profile/${post.author.id}`} className="font-semibold">
            {post.author.name}
          </Link>
          <span className="text-gray-400">· {post.created_at}</span>
          {!isOwner && (
            <>
              <span className="text-gray-400">·</span>
              <button
                onClick={() => onFollow(post.author.id)}
                className="text-blue-500 font-semibold"
              >
                {post.author.is_following ? "Following" : "Follow"}
              </button>
            </>
          )}
        </div>

        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="text-xl leading-none px-1 text-gray-600"
            >
              ···
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-md text-sm z-10 w-28">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(post.id);
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-50 text-red-500"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit form */}
      {isEditing && (
        <div className="px-3 pb-3 flex flex-col gap-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="border border-gray-300 rounded-sm px-2 py-1 text-sm"
          />
          <input
            type="text"
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            className="border border-gray-300 rounded-sm px-2 py-1 text-sm"
          />
          <div className="flex gap-3 text-sm">
            <button
              onClick={async () => {
                const success = await onUpdate(post.id, {
                  title: editTitle,
                  body: editBody,
                });
                if (success) setIsEditing(false);
              }}
              className="text-blue-500 font-semibold"
            >
              Save
            </button>
            <button
              onClick={() => {
                setEditTitle(post.title);
                setEditBody(post.body);
                setIsEditing(false);
              }}
              className="text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Media */}
      {post.media.length > 0 && (
        <div className="relative bg-black aspect-square flex items-center justify-center overflow-hidden">
          {currentMedia.type === "image" && (
            <img
              src={currentMedia.content}
              loading="lazy"
              alt={post.title}
              className="w-full h-full object-cover"
            />
          )}
          {currentMedia.type === "text" && (
            <p className="text-white text-center px-6">
              {currentMedia.content}
            </p>
          )}
          {currentMedia.type === "video" && (
            <video
              src={currentMedia.content}
              controls
              autoPlay
              className="w-full h-full object-cover"
            />
          )}

          {post.media.length > 1 && (
            <>
              {currentMediaIndex > 0 && (
                <button
                  onClick={prevMedia}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-7 h-7 flex items-center justify-center text-sm"
                >
                  ←
                </button>
              )}
              {currentMediaIndex < post.media.length - 1 && (
                <button
                  onClick={nextMedia}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-7 h-7 flex items-center justify-center text-sm"
                >
                  →
                </button>
              )}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {post.media.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      i === currentMediaIndex ? "bg-blue-500" : "bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Caption */}
      {(post.title || post.body) && (
        <div className="px-3 pt-5 text-sm flex flex-col gap-1">
          <span className="font-semibold mr-1">{post.author.name}</span>
          <p>{post.title}</p>
          <p>{post.body}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-3 pt-2.5">
        <button onClick={() => onLike(post.id)}>
          <HeartIcon filled={post.is_liked_by_user} />
        </button>
        <button onClick={toggleComments}>
          <CommentIcon />
        </button>
      </div>

      {/* Likes count */}
      <p className="px-3 pt-1.5 text-sm font-semibold">
        {post.likes_count} {post.likes_count === 1 ? "like" : "likes"}
      </p>

      {/* Comments toggle */}
      {post.comments_count > 0 && (
        <button
          onClick={toggleComments}
          className="px-3 pt-1 text-sm text-gray-400 block"
        >
          {showComments
            ? "Hide comments"
            : `View all ${post.comments_count} comments`}
        </button>
      )}

      {loadingComments && (
        <p className="px-3 pt-1 text-sm text-gray-400">Loading comments...</p>
      )}

      {showComments && (
        <div className="px-3 pt-1 flex flex-col gap-1">
          {comments.map((comment) => {
            const isCommentOwner = comment.author_id === currentUserId;

            return (
              <div key={comment.id} className="text-sm">
                {comment.id === editingCommentId ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editCommentContent}
                      onChange={(e) => setEditCommentContent(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-sm px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => handleCommentUpdate(comment.id)}
                      className="text-blue-500 font-semibold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCommentId(null)}
                      className="text-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p>
                      <span className="font-semibold mr-1">
                        {comment.author}
                      </span>
                      {comment.content}
                    </p>
                    {isCommentOwner && (
                      <div className="flex gap-2 text-xs text-gray-400 shrink-0 ml-2">
                        <button
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditCommentContent(comment.content);
                          }}
                        >
                          Edit
                        </button>
                        <button onClick={() => handleCommentDelete(comment.id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-2">
        <CreateComment
          postId={post.id}
          onCommentCreated={handleCommentCreated}
        />
      </div>
    </div>
  );
}

export default Post;
