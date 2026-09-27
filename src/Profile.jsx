import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "./api";
import Post from "./Post";
import CreatePost from "./CreatePost";
import Header from "./Header";

function Profile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editName, setEditName] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPostIndex, setSelectedPostIndex] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const currentUserId = Number(localStorage.getItem("userId"));
  const isOwner = Number(userId) === Number(currentUserId);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/users/${userId}`);
        setUser(response.data.data);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get(`/users/${userId}/posts`);
        setPosts(response.data.data);
      } catch (err) {
        console.error("Failed to load user's posts", err);
      }
    };
    fetchPosts();
  }, [userId]);

  const handleFollowToggle = async () => {
    if (!user) return;

    try {
      setUser((prevUser) => ({
        ...prevUser,
        is_following: !prevUser.is_following,
        followers_count: prevUser.is_following
          ? prevUser.followers_count - 1
          : prevUser.followers_count + 1,
      }));
    } catch (err) {
      console.error("Failed to toggle follow status", err);
    }
  };

  const handleStartEdit = () => {
    setEditName(user?.name || "");
    setEditBio(user?.bio || "");
    setIsEditing(true);
  };

  const handleFileChange = (e) => {
    setAvatarFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", editName);
      formData.append("bio", editBio);
      formData.append("_method", "PUT");

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await api.post("/user", formData);

      setUser(response.data.data);
      setIsEditing(false);
      setAvatarFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/likes`);
      setPosts((prev) =>
        prev.map((p) =>
          p.id !== postId
            ? p
            : {
                ...p,
                is_liked_by_user: !p.is_liked_by_user,
                likes_count: p.is_liked_by_user
                  ? p.likes_count - 1
                  : p.likes_count + 1,
              },
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollow = async (authorId) => {
    try {
      await api.post(`/users/${authorId}/follow`);
      setPosts((prev) =>
        prev.map((p) =>
          p.author.id !== authorId
            ? p
            : {
                ...p,
                author: { ...p.author, is_following: !p.author.is_following },
              },
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setSelectedPostIndex(null); // NEW: close the modal if the open post was deleted
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePost = async (postId, updatedData) => {
    try {
      await api.put(`/posts/${postId}`, updatedData);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, ...updatedData } : p)),
      );
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleCommentCountUp = (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p,
      ),
    );
  };
  const handleCommentCountDown = (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments_count: p.comments_count - 1 } : p,
      ),
    );
  };

  const handlePostCreated = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
    setIsCreateOpen(false);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );

  const selectedPost =
    selectedPostIndex !== null ? posts[selectedPostIndex] : null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header/>
      <div className="max-w-[600px] mx-auto pt-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-6 sm:gap-10">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt="Avatar"
              className="w-20 h-20 sm:w-36 sm:h-36 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-20 h-20 sm:w-36 sm:h-36 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-semibold text-gray-500 shrink-0">
              {user.name.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-xl font-light">{user.name}</h2>

              {isOwner && !isEditing && (
                <button
                  onClick={handleStartEdit}
                  className="text-sm font-semibold border border-gray-300 rounded-lg px-4 py-1.5"
                >
                  Edit profile
                </button>
              )}

              {!isOwner && (
                <button
                  onClick={handleFollowToggle}
                  className={`text-sm font-semibold rounded-lg px-5 py-1.5 ${
                    user.is_following
                      ? "border border-gray-300 text-black"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {user.is_following ? "Following" : "Follow"}
                </button>
              )}
            </div>

            <div className="flex gap-6 mt-4 text-sm">
              <span>
                <span className="font-semibold">{user.posts_count}</span> posts
              </span>
              <span>
                <span className="font-semibold">{user.followers_count}</span>{" "}
                followers
              </span>
              <span>
                <span className="font-semibold">{user.following_count}</span>{" "}
                following
              </span>
            </div>

            <p className="text-sm mt-3 whitespace-pre-line">
              {user?.bio || (isOwner ? "No bio added yet." : "")}
            </p>
          </div>
        </div>

        {/* Edit form */}
        {isEditing && (
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-lg mt-6 p-4 flex flex-col gap-3"
          >
            <div>
              <label className="text-sm font-semibold block mb-1">Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full border border-gray-300 rounded-sm px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">Bio</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Write a short bio..."
                rows={3}
                className="w-full border border-gray-300 rounded-sm px-2 py-1.5 text-sm resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1">Avatar</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-sm"
              />
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}

            <div className="flex gap-3 mt-1">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold
                           text-sm rounded-lg px-4 py-1.5 disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-sm font-semibold border border-gray-300 rounded-lg px-4 py-1.5"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* New post trigger */}
        {isOwner && (
          <div className="mt-6">
            {!isCreateOpen ? (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="w-full border border-dashed border-gray-300 rounded-lg py-2.5
                           text-sm text-gray-500 font-semibold"
              >
                + New post
              </button>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="flex justify-end px-3 pt-2">
                  <button
                    onClick={() => setIsCreateOpen(false)}
                    className="text-gray-400 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
                <CreatePost onPostCreated={handlePostCreated} />
              </div>
            )}
          </div>
        )}

        {/* Grid tab bar */}
        <div className="border-t border-gray-200 mt-8 flex justify-center">
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide py-3 border-t-2 border-black -mt-px text-gray-800">
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 fill-none stroke-black stroke-2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            POSTS
          </div>
        </div>

        {/* Grid */}
        {posts.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">
            No posts yet.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-1 pb-10">
            {posts.map((post, index) => {
              const thumb = post.media?.[0];
              return (
                <button
                  key={post.id}
                  onClick={() => setSelectedPostIndex(index)}
                  className="relative aspect-square bg-gray-200 overflow-hidden"
                >
                  {thumb?.type === "image" && (
                    <img
                      src={thumb.content}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {thumb?.type === "video" && (
                    <>
                      <video
                        src={thumb.content}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1.5 right-1.5 text-white text-xs">
                        ▶
                      </span>
                    </>
                  )}
                  {(!thumb || thumb.type === "text") && (
                    <div className="w-full h-full flex items-center justify-center p-2 text-center text-xs text-gray-500 bg-gray-100">
                      {post.title || thumb?.content || "Text post"}
                    </div>
                  )}
                  {post.media?.length > 1 && (
                    <span className="absolute top-1.5 right-1.5 text-white text-xs drop-shadow">
                      ⧉
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Post modal  */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setSelectedPostIndex(null)}
        >
          <div
            className="max-w-[470px] w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setSelectedPostIndex(null)}
                className="text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <Post
              post={selectedPost}
              onLike={handleLike}
              onFollow={handleFollow}
              onDelete={handleDeletePost}
              onUpdate={handleUpdatePost}
              onCommentCountUp={handleCommentCountUp}
              onCommentCountDown={handleCommentCountDown}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
