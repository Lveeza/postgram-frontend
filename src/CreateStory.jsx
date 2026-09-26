import { useState } from "react";
import api from "./api";

function CreateStory({ onStoryCreated }) {
  const [storyType, setStoryType] = useState("text");
  const [textContent, setTextContent] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#FFC0CB");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFilesChange = (e) => {
    setMediaFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      let response;

      if (storyType === "text") {
        response = await api.post("/stories", {
          type: "text",
          content: textContent,
          background_color: backgroundColor,
        });
        setTextContent("");
      } else {
        const formData = new FormData();
        formData.append("type", storyType);

        mediaFiles.forEach((file) => {
          formData.append("content[]", file);
        });

        response = await api.post("/stories", formData);
        setMediaFiles([]);
      }

      if (onStoryCreated) {
        onStoryCreated(response.data.stories);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create story");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px" }}>
      <select value={storyType} onChange={(e) => setStoryType(e.target.value)}>
        <option value="text">Text</option>
        <option value="image">Image</option>
        <option value="video">Video</option>
      </select>
      <br />

      {storyType === "text" ? (
        <>
          <input
            type="text"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Your story text"
          />
          <br />
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
          />
        </>
      ) : (
        <input
          type="file"
          accept={storyType === "image" ? "image/*" : "video/*"}
          multiple
          onChange={handleFilesChange}
        />
      )}

      <br />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? "Posting..." : "Post Story"}
      </button>
    </form>
  );
}

export default CreateStory;