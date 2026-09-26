import { useState, useEffect } from "react";
import api from "./api";
import CreateStory from "./CreateStory";

function Stories() {
  const [storyGroups, setStoryGroups] = useState([]);
  const [activeGroupIndex, setActiveGroupIndex] = useState(null); // which author is open
  const [activeStoryIndex, setActiveStoryIndex] = useState(0); // which story within that author
  const [viewedStoryIds, setViewedStoryIds] = useState(new Set());

  const activeGroup =
    activeGroupIndex !== null ? storyGroups[activeGroupIndex] : null;
  const activeStory = activeGroup
    ? activeGroup.stories[activeStoryIndex]
    : null;

  const currentStoryUserId = Number(localStorage.getItem("userId"));
  const isOwner = activeStory?.user_id === currentStoryUserId;

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

  const currentUserId = Number(localStorage.getItem("userId"));

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
            stories: group.stories.filter((story) => story.id !== activeStory.id),
          };
        })
        .filter((group) => group.stories.length > 0)
    );

    closeViewer();
  } catch (err) {
    console.error("Failed to delete story", err);
  }
};

  return (
    <div>
      {/* Bubble strip */}
      <CreateStory onStoryCreated={handleStoryCreated} />
      <div
        style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          padding: "10px",
        }}
      >
        {storyGroups.map((group, index) => (
          <div
            key={group.author.id}
            onClick={() => openStories(index)}
            style={{
              cursor: "pointer",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              border: "2px solid hotpink",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {group.author.name.charAt(0)}
          </div>
        ))}
      </div>

      {/* Story viewer */}
      {activeStory && (
        <div
          onClick={nextStory}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor:
              activeStory.type === "text"
                ? activeStory.background_color
                : "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 1000,
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeViewer();
            }}
            style={{ position: "absolute", top: "20px", right: "20px" }}
          >
            Close
          </button>

          {isOwner && (
            <div>
              <button onClick={handleDeleteStory}>Delete Story</button>
            </div>
          )}

          {activeStory.type === "text" && (
            <p
              style={{ fontSize: "24px", padding: "20px", textAlign: "center" }}
            >
              {activeStory.content}
            </p>
          )}
          {activeStory.type === "image" && (
            <img
              src={activeStory.content}
              alt="Story"
              style={{ maxWidth: "90%", maxHeight: "90%" }}
            />
          )}
          {activeStory.type === "video" && (
            <video
              src={activeStory.content}
              controls
              autoPlay
              style={{ maxWidth: "90%", maxHeight: "90%" }}
            />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStoryLike();
            }}
            style={{ position: "absolute", bottom: "30px", left: "20px" }}
          >
            {activeStory.is_liked_by_user ? "❤️" : "🤍"}{" "}
            {activeStory.likes_count}
          </button>

          <p style={{ position: "absolute", bottom: "30px", right: "20px" }}>
            👁 {activeStory.views_count}
          </p>
        </div>
      )}
    </div>
  );
}

export default Stories;
