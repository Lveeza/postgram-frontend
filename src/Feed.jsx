import { useState, useEffect, useRef, useCallback } from 'react';
import api from './api';
import Post from './Post';
import Stories from './Stories';


function Feed() {
  const [posts, setPosts] = useState([]);
  const [nextUrl, setNextUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const observerTarget = useRef(null); 

 
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/posts');
        setPosts(response.data.data);
        setNextUrl(response.data.links.next);
      } catch (err) {
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

 
  const fetchNextPage = useCallback(async () => {
    if (!nextUrl || loadingMore) return; 
    setLoadingMore(true);
    try {
      const response = await api.get(nextUrl);
      setPosts((prev) => [...prev, ...response.data.data]);
      setNextUrl(response.data.links.next);
    } catch (err) {
      console.error('Failed to load more posts', err);
    } finally {
      setLoadingMore(false);
    }
  }, [nextUrl, loadingMore]);


  const handleLike = async (postId) => {
  try {
    await api.post(`/posts/${postId}/likes`);

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== postId) return post; 

        return {
          ...post,
          is_liked_by_user: !post.is_liked_by_user,
          likes_count: post.is_liked_by_user
            ? post.likes_count - 1
            : post.likes_count + 1,
        };
      })
    );
  } catch (err) {
    console.error('Failed to toggle like', err);
  }
};


const handleFollow = async (userId) => {
  try {
    await api.post(`/users/${userId}/follow`);

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.author.id !== userId) return post;
        return {
          ...post,
          author: {
            ...post.author,
            is_following: !post.author.is_following,
          },
        };
      })
    );
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to follow user'); 
  }
};


  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [fetchNextPage]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;


  return (
    <div>
      <Stories />
     {posts.map((post) => (
  <Post key={post.id} post={post} onLike={handleLike} onFollow={handleFollow} />
))}
     <div ref={observerTarget} style={{ height: '20px' }}>
        {loadingMore && <p>Loading more...</p>}
      </div>
    </div>
  );
}

export default Feed;