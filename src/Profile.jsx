import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "./api";
import Post from "./Post";
import CreatePost from "./CreatePost";

function Profile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

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
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: "15px", margin: "10px" }}>
      {user?.avatar_url && (
        <img
          src={user.avatar_url}
          alt="Avatar"
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      )}
      <h2>{user.name}</h2>
      <p>{user?.bio || "No bio added yet."}</p>

      <p>
        {user.posts_count} posts · {user.followers_count} followers ·{" "}
        {user.following_count} following
      </p>

      {Number(userId) !== currentUserId && (
        <button onClick={handleFollowToggle}>
          {user.is_following ? "Unfollow" : "Follow"}
        </button>
      )}

      {isOwner && !isEditing && (
        <button onClick={handleStartEdit}>Edit Profile</button>
      )}

      {isEditing && (
        <form onSubmit={handleSubmit} style={{ marginTop: "15px" }}>
          <div>
            <label>Bio: </label>
            <br />
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder="Write a short bio..."
            />
          </div>

          <div style={{ marginTop: "10px" }}>
            <label>Avatar: </label>
            <br />
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <div style={{ marginTop: "10px" }}>
            <button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              style={{ marginLeft: "10px" }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {
        isOwner &&
      <CreatePost onPostCreated={handlePostCreated} />
      }

      <div style={{ marginTop: "20px" }}>
        {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            onLike={handleLike}
            onFollow={handleFollow}
            onDelete={handleDeletePost}
            onUpdate={handleUpdatePost}
            onCommentCountUp={handleCommentCountUp}
            onCommentCountDown={handleCommentCountDown}
          />
        ))}
      </div>
    </div>
  );
}

export default Profile;
