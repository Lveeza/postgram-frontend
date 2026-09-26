import { useState, useEffect } from "react";
import api from "./api";

function CreateStory({
  isOpen,
  onClose,
  initialType,
  initialFiles,
  onStoryCreated,
}) {
  const [storyType, setStoryType] = useState(initialType || "text");
  const [textContent, setTextContent] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#FFC0CB");
  const [mediaFiles, setMediaFiles] = useState(initialFiles || []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStoryType(initialType || "text");
      setMediaFiles(initialFiles || []);
      setError("");
    }
  }, [isOpen, initialType, initialFiles]);

  if (!isOpen) return null;

  const previewUrl =
    mediaFiles.length > 0 ? URL.createObjectURL(mediaFiles[0]) : null;

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
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create story");
    } finally {
      setSubmitting(false);
    }
  };

  const colorOptions = [
    "#FFC0CB",
    "#87CEEB",
    "#98FB98",
    "#FFD700",
    "#DDA0DD",
    "#000000",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-lg w-full max-w-[400px] mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-sm">
            {storyType === "text" ? "Create text story" : "New story"}
          </h2>
          <button
            onClick={onClose}
            className="text-xl text-gray-500 leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {storyType === "text" ? (
            <div
              className="rounded-lg h-64 flex items-center justify-center mb-4 transition-colors"
              style={{ backgroundColor }}
            >
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Type your story..."
                rows={3}
                className="bg-transparent text-white text-xl text-center placeholder-white/70 outline-none resize-none w-4/5"
              />
            </div>
          ) : (
            <div className="h-64 rounded-lg mb-4 overflow-hidden bg-black flex items-center justify-center">
              {storyType === "image" && previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain"
                />
              )}
              {storyType === "video" && previewUrl && (
                <video
                  src={previewUrl}
                  controls
                  className="max-h-full max-w-full object-contain"
                />
              )}
              {mediaFiles.length > 1 && (
                <p className="absolute mt-56 text-white text-xs bg-black/50 px-2 py-1 rounded">
                  +{mediaFiles.length - 1} more
                </p>
              )}
            </div>
          )}

          {storyType === "text" && (
            <div className="flex gap-2 justify-center mb-4">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setBackgroundColor(color)}
                  className={`w-7 h-7 rounded-full border-2 ${
                    backgroundColor === color
                      ? "border-blue-500"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}

          {error && (
            <p className="text-red-500 text-xs text-center mb-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold
                       text-sm rounded-lg py-2 disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Share to story"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateStory;
