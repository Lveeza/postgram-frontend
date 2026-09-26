import { useState, useEffect, useRef } from "react";
import api from "./api";
import CreateStory from "./CreateStory";

function HeartIcon({ filled }) {
  return filled ? (
    <svg viewBox="0 0 24 24" class="w-6 h-6 fill-red-500">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6 fill-none stroke-white stroke-2"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5 fill-none stroke-white stroke-2"
    >
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function Stories() {
  const [storyGroups, setStoryGroups] = useState([]);
  const [activeGroupIndex, setActiveGroupIndex] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [viewedStoryIds, setViewedStoryIds] = useState(new Set());

  // NEW: controls the "preview & share" modal, and what it opens with
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pickedFiles, setPickedFiles] = useState([]);
  const [pickedType, setPickedType] = useState("image");
  const fileInputRef = useRef(null); // NEW: the real, hidden file input

  const activeGroup =
    activeGroupIndex !== null ? storyGroups[activeGroupIndex] : null;
  const activeStory = activeGroup
    ? activeGroup.stories[activeStoryIndex]
    : null;

  const currentUserId = Number(localStorage.getItem("userId"));
  const isOwner = activeStory?.user_id === currentUserId;

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await api.get("/stories");
        setStoryGroups(response.data);
      } catch (err) {
        console.error("Failed to load stories", err);
      }
    };
    fetchStories();
  }, []);

  const openStories = (groupIndex) => {
    setActiveGroupIndex(groupIndex);
    setActiveStoryIndex(0);
  };

  const closeViewer = () => {
    setActiveGroupIndex(null);
  };

  const nextStory = () => {
    const currentGroup = storyGroups[activeGroupIndex];
    if (activeStoryIndex < currentGroup.stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      closeViewer();
    }
  };

  const prevStory = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    }
  };

  useEffect(() => {
    if (!activeStory) return;
    if (viewedStoryIds.has(activeStory.id)) return;

    const recordView = async () => {
      try {
        const response = await api.post(`/stories/${activeStory.id}/views`);

        setViewedStoryIds((prev) => new Set(prev).add(activeStory.id));

        setStoryGroups((prevGroups) =>
          prevGroups.map((group) => ({
            ...group,
            stories: group.stories.map((story) =>
              story.id === activeStory.id
                ? { ...story, views_count: response.data.views_count }
                : story,
            ),
          })),
        );
      } catch (err) {
        console.error("Failed to record view", err);
      }
    };

    recordView();
  }, [activeStory]);

  const handleStoryLike = async () => {
    try {
      await api.post(`/stories/${activeStory.id}/likes`);

      setStoryGroups((prevGroups) =>
        prevGroups.map((group) => ({
          ...group,
          stories: group.stories.map((story) =>
            story.id === activeStory.id
              ? {
                  ...story,
                  is_liked_by_user: !story.is_liked_by_user,
                  likes_count: story.is_liked_by_user
                    ? story.likes_count - 1
                    : story.likes_count + 1,
                }
              : story,
          ),
        })),
      );
    } catch (err) {
      console.error("Failed to like story", err);
    }
  };

  const handleStoryCreated = (newStories) => {
    const normalizedStories = newStories.map((story) => ({
      ...story,
      likes_count: 0,
      views_count: 0,
      is_liked_by_user: false,
    }));

    setStoryGroups((prevGroups) => {
      const existingGroupIndex = prevGroups.findIndex(
        (group) => group.author.id === currentUserId,
      );

      if (existingGroupIndex !== -1) {
        return prevGroups.map((group, index) =>
          index === existingGroupIndex
            ? { ...group, stories: [...group.stories, ...normalizedStories] }
            : group,
        );
      } else {
        const newGroup = {
          author: { id: currentUserId, name: localStorage.getItem("userName") },
          stories: normalizedStories,
        };
        return [...prevGroups, newGroup];
      }
    });
  };

  const handleDeleteStory = async () => {
    try {
      await api.delete(`/stories/${activeStory.id}`);

      setStoryGroups((prevGroups) =>
        prevGroups
          .map((group, index) => {
            if (index !== activeGroupIndex) return group;
            return {
              ...group,
              stories: group.stories.filter(
                (story) => story.id !== activeStory.id,
              ),
            };
          })
          .filter((group) => group.stories.length > 0),
      );

      closeViewer();
    } catch (err) {
      console.error("Failed to delete story", err);
    }
  };

  const handleFilesPicked = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const isVideo = files[0].type.startsWith("video");
    setPickedType(isVideo ? "video" : "image");
    setPickedFiles(files);
    setIsCreateOpen(true);
    e.target.value = "";
  };

  const handlePlusClick = () => {
    fileInputRef.current.click();
  };

  const openTextStory = () => {
    setPickedFiles([]);
    setPickedType("text");
    setIsCreateOpen(true);
  };

  const ownGroupIndex = storyGroups.findIndex(
    (g) => g.author.id === currentUserId,
  );
  const ownGroup = ownGroupIndex !== -1 ? storyGroups[ownGroupIndex] : null;
  const otherGroups = storyGroups.filter((g) => g.author.id !== currentUserId);

  const Avatar = ({ author, hasUnviewed }) => (
    <div
      className={`w-16 h-16 rounded-full p-[2px] ${
        hasUnviewed
          ? "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500"
          : "bg-gray-300" // <-- this is the "uncolored once viewed" behavior you asked about
      }`}
    >
      <div className="w-full h-full rounded-full bg-white p-[2px]">
        {author.avatar_url ? (
          <img
            src={author.avatar_url}
            alt={author.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold text-gray-500">
            {author.name.charAt(0)}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFilesPicked}
        className="hidden"
      />

      <div className="flex gap-4 overflow-x-auto px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex flex-col items-center gap-1 shrink-0">
          <div
            className="relative cursor-pointer"
            onClick={() =>
              ownGroup ? openStories(ownGroupIndex) : handlePlusClick()
            }
          >
            {ownGroup ? (
              <Avatar
                author={ownGroup.author}
                hasUnviewed={ownGroup.stories.some(
                  (s) => !viewedStoryIds.has(s.id),
                )}
              />
            ) : (
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-2xl">
                +
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlusClick();
              }}
              className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center border-2 border-white"
            >
              +
            </button>
          </div>
          <span className="text-xs text-gray-600 max-w-16 truncate">
            Your story
          </span>
        </div>

        <div className="flex flex-col items-center gap-1 shrink-0">
          <button
            onClick={openTextStory}
            className="w-16 h-16 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-500 font-serif text-xl"
          >
            Aa
          </button>
          <span className="text-xs text-gray-600">Text</span>
        </div>

        {/* Other users' story bubbles */}
        {otherGroups.map((group) => {
          const realIndex = storyGroups.findIndex(
            (g) => g.author.id === group.author.id,
          );
          return (
            <div
              key={group.author.id}
              onClick={() => openStories(realIndex)}
              className="flex flex-col items-center gap-1 shrink-0 cursor-pointer"
            >
              <Avatar
                author={group.author}
                hasUnviewed={group.stories.some(
                  (s) => !viewedStoryIds.has(s.id),
                )}
              />
              <span className="text-xs text-gray-600 max-w-16 truncate">
                {group.author.name}
              </span>
            </div>
          );
        })}
      </div>

      <CreateStory
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        initialType={pickedType}
        initialFiles={pickedFiles}
        onStoryCreated={handleStoryCreated}
      />

      {/* Story viewer */}
      {activeStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backgroundColor:
              activeStory.type === "text"
                ? activeStory.background_color
                : "#000",
          }}
        >
          <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
            {activeGroup.stories.map((_, i) => (
              <div
                key={i}
                className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className={`h-full bg-white ${i <= activeStoryIndex ? "w-full" : "w-0"}`}
                />
              </div>
            ))}
          </div>

          <div className="absolute top-7 left-3 right-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              {activeGroup.author.avatar_url ? (
                <img
                  src={activeGroup.author.avatar_url}
                  alt={activeGroup.author.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm">
                  {activeGroup.author.name.charAt(0)}
                </div>
              )}
              <span className="text-white text-sm font-semibold">
                {activeGroup.author.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {isOwner && (
                <button
                  onClick={handleDeleteStory}
                  className="text-red-700 text-xs  px-2 py-1 rounded"
                >
                  Delete
                </button>
              )}
              <button
                onClick={closeViewer}
                className="text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
          </div>

          <div className="absolute inset-0 flex">
            <div className="w-1/3 h-full" onClick={prevStory} />
            <div className="w-2/3 h-full" onClick={nextStory} />
          </div>

          {activeStory.type === "text" && (
            <p className="text-white text-2xl px-8 text-center">
              {activeStory.content}
            </p>
          )}
          {activeStory.type === "image" && (
            <img
              src={activeStory.content}
              alt="Story"
              className="max-w-[90%] max-h-[90%] object-contain"
            />
          )}
          {activeStory.type === "video" && (
            <video
              src={activeStory.content}
              controls
              autoPlay
              className="max-w-[90%] max-h-[90%] object-contain"
            />
          )}

          <div className="absolute bottom-6 left-3 right-3 flex items-center justify-between z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStoryLike();
              }}
              className="flex items-center gap-1.5"
            >
              <HeartIcon filled={activeStory.is_liked_by_user} />
              <span className="text-white text-sm">
                {activeStory.likes_count}
              </span>
            </button>

            <p className="flex items-center gap-1.5">
              <EyeIcon />
              <span className="text-white text-sm">
                {activeStory.views_count}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Stories;
