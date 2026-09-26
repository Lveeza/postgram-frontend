import { useState } from "react";
import api from "./api";

function CreatePost({ onPostCreated }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const [contentType, setContentType] = useState("text");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleVideoChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("body", body);

      let mediaIndex = 0;

      if (caption.trim() !== "") {
        formData.append(`media[${mediaIndex}][type]`, "text");
        formData.append(`media[${mediaIndex}][content]`, caption);
        mediaIndex++;
      }

      if (imageFile) {
        formData.append(`media[${mediaIndex}][type]`, "image");
        formData.append(`media[${mediaIndex}][content]`, imageFile);
        mediaIndex++;
      }

      if (videoFile) {
        formData.append(`media[${mediaIndex}][type]`, "video");
        formData.append(`media[${mediaIndex}][content]`, videoFile);
        mediaIndex++;
      }

      const response = await api.post("/posts", formData);

      setTitle("");
      setBody("");
      setCaption("");
      setImageFile(null);
      setVideoFile(null);
      setContentType("text");

      if (onPostCreated) {
        onPostCreated(response.data.post);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ border: "1px solid #ccc", padding: "10px", margin: "10px" }}
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
      />
      <br />
      <br />

      <label>Select Post Type: </label>
      <select
        value={contentType}
        onChange={(e) => setContentType(e.target.value)}
      >
        <option value="text">Text / Thoughts</option>
        <option value="caption">Caption Only</option>
        <option value="image">Image Upload</option>
        <option value="video">Video Upload</option>
      </select>
      <br />
      <br />

      {contentType === "text" && (
        <>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's on your mind?"
          />
          <br />
        </>
      )}

      {contentType === "caption" && (
        <>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption"
          />
          <br />
        </>
      )}

      {contentType === "image" && (
        <>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <br />
        </>
      )}

      {contentType === "video" && (
        <>
          <input type="file" accept="video/*" onChange={handleVideoChange} />
          <br />
        </>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Posting..." : "Post"}
      </button>
    </form>
  );
}

export default CreatePost;
