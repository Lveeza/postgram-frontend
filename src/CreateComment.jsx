// CreateComment.jsx
import { useState } from "react";
import api from "./api";

function CreateComment({ postId, onCommentCreated }) {
  const [content, setContent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/posts/${postId}/comments`, { content });
      onCommentCreated(response.data.comment);
      setContent("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add comment");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center border-t border-gray-100 px-3 py-2.5"
    >
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1 text-sm outline-none placeholder-gray-400"
      />
      <button
        type="submit"
        disabled={content.trim() === ""}
        className="text-blue-500 font-semibold text-sm disabled:text-blue-200 disabled:cursor-not-allowed"
      >
        Post
      </button>
    </form>
  );
}

export default CreateComment;
