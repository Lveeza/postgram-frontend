import { useState } from "react";
import api from "./api";
import CreateComment from "./CreateComment";

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
      const response = await api.put(`/comments/${commentId}`, {
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
    <div style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
      <p>
        <strong>{post.author.name}</strong> · {post.created_at}
      </p>

      <button onClick={() => onFollow(post.author.id)}>
        {post.author.is_following ? "Unfollow" : "Follow"}
      </button>

      {isOwner && (
        <div>
          <button onClick={() => setIsEditing(true)}>Edit</button>
          <button onClick={() => onDelete(post.id)}>Delete</button>
          {isEditing && (
            <>
              <button
                onClick={() => {
                  setEditTitle(post.title);
                  setEditBody(post.body);
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
              <br />
              <input
                type="text"
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
              />
              <br />
              <button
                onClick={async () => {
                  const success = await onUpdate(post.id, {
                    title: editTitle,
                    body: editBody,
                  });
                  if (success) {
                    setIsEditing(false);
                  }
                }}
              >
                Save
              </button>
            </>
          )}
        </div>
      )}

      <p>{post.title}</p>
      <p>{post.body}</p>
      {post.media.length > 0 && (
        <div>
          {currentMedia.type === "image" && (
            <img
              src={currentMedia.content}
              loading="lazy"
              alt={post.title}
              style={{ maxWidth: "100%", display: "block", margin: "8px 0" }}
            />
          )}
          {currentMedia.type === "text" && <p>{currentMedia.content}</p>}
          {currentMedia.type === "video" && (
            <video
              src={currentMedia.content}
              controls
              style={{ maxWidth: "100%", display: "block", margin: "8px 0" }}
            />
          )}

          {post.media.length > 1 && (
            <div>
              <button onClick={prevMedia} disabled={currentMediaIndex === 0}>
                ← Prev
              </button>
              <span>
                {" "}
                {currentMediaIndex + 1} / {post.media.length}{" "}
              </span>
              <button
                onClick={nextMedia}
                disabled={currentMediaIndex === post.media.length - 1}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      <button onClick={() => onLike(post.id)}>
        {post.is_liked_by_user ? "❤️ Liked" : "🤍 Like"} ({post.likes_count})
      </button>

      <button onClick={toggleComments}>
        {showComments ? "Hide" : "View"} comments ({post.comments_count})
      </button>

      {loadingComments && <p>Loading comments...</p>}

      {comments.map((comment) => {
        const isCommentOwner = comment.author_id === currentUserId;

        return (
          <p key={comment.id}>
            <strong>{comment.author}</strong>: {comment.content}
            {isCommentOwner && (
              <>
                <button onClick={() => handleCommentDelete(comment.id)}>
                  Delete comment
                </button>
                {comment.id === editingCommentId ? (
                  <div>
                    <input
                      type="text"
                      value={editCommentContent}
                      onChange={(e) => setEditCommentContent(e.target.value)}
                    />
                    <button onClick={() => handleCommentUpdate(comment.id)}>
                      Save
                    </button>
                    <button onClick={() => setEditingCommentId(null)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingCommentId(comment.id);
                      setEditCommentContent(comment.content);
                    }}
                  >
                    Edit
                  </button>
                )}
              </>
            )}
          </p>
        );
      })}
      <CreateComment postId={post.id} onCommentCreated={handleCommentCreated} />
    </div>
  );
}

export default Post;
