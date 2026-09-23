import { useState } from "react";
import api from "./api";

function CreateComment({ postId, onCommentCreated}) {
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
    <form onSubmit={handleSubmit}>
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
      />
      <button type="submit">Post</button>
    </form>
  );
}

export default CreateComment;