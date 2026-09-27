import { useState, useRef } from "react";
import api from "./api";

function CreatePost({ onPostCreated }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mediaItems, setMediaItems] = useState([]); // [{id, type, file?, content?, previewUrl?}]
  const [textDraft, setTextDraft] = useState("");
  const [isAddingText, setIsAddingText] = useState(false);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);

    const newItems = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`, 
      type: file.type.startsWith("video") ? "video" : "image",
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setMediaItems((prev) => [...prev, ...newItems]);
    e.target.value = ""; 
  };

  const handleAddTextSlide = () => {
    if (textDraft.trim() === "") return;

    setMediaItems((prev) => [
      ...prev,
      { id: `text-${Date.now()}`, type: "text", content: textDraft },
    ]);
    setTextDraft("");
    setIsAddingText(false);
  };

  const handleRemoveItem = (id) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("body", body);

      mediaItems.forEach((item, index) => {
        formData.append(`media[${index}][type]`, item.type);
        formData.append(
          `media[${index}][content]`,
          item.type === "text" ? item.content : item.file,
        );
      });

      const response = await api.post("/posts", formData);

      setTitle("");
      setBody("");
      setMediaItems([]);

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
    <form onSubmit={handleSubmit} className="p-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post title"
        className="w-full text-sm font-semibold outline-none placeholder-gray-400 mb-2"
      />

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What's on your mind?"
        rows={2}
        className="w-full text-sm outline-none placeholder-gray-400 resize-none mb-3"
      />

      {/* Media strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
        {/* Add-media tile */}
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-gray-300
                     flex items-center justify-center text-gray-400 text-2xl"
        >
          +
        </button>

        {/* Add-text tile */}
        <button
          type="button"
          onClick={() => setIsAddingText(true)}
          className="shrink-0 w-20 h-20 rounded-lg border-2 border-gray-300
                     flex items-center justify-center text-gray-500 font-serif text-lg"
        >
          Aa
        </button>

        {/* Added items */}
        {mediaItems.map((item) => (
          <div
            key={item.id}
            className="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100"
          >
            {item.type === "image" && (
              <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
            )}
            {item.type === "video" && (
              <video src={item.previewUrl} className="w-full h-full object-cover" />
            )}
            {item.type === "text" && (
              <div className="w-full h-full flex items-center justify-center p-1 text-center text-[10px] text-gray-600">
                {item.content}
              </div>
            )}
            <button
              type="button"
              onClick={() => handleRemoveItem(item.id)}
              className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60
                         text-white text-xs flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFilesChange}
        className="hidden"
      />

      {/* Inline text-slide composer */}
      {isAddingText && (
        <div className="mb-3 border border-gray-200 rounded-lg p-2">
          <input
            type="text"
            value={textDraft}
            onChange={(e) => setTextDraft(e.target.value)}
            placeholder="Type a text slide..."
            className="w-full text-sm outline-none mb-2"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddTextSlide}
              className="text-blue-500 text-sm font-semibold"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setTextDraft("");
                setIsAddingText(false);
              }}
              className="text-gray-400 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold
                   text-sm rounded-lg py-2 disabled:opacity-50"
      >
        {submitting ? "Posting..." : "Share"}
      </button>
    </form>
  );
}

export default CreatePost;