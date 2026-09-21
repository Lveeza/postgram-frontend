import { useState, useEffect, useRef, useCallback } from 'react';
import api from './api';

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
      {posts.map((post) => (
  <div key={post.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
    <p><strong>{post.author.name}</strong> · {post.created_at}</p>
    <p>{post.title}</p>
    <p>{post.body}</p>

    {post.media.map((item, index) => {
      if (item.type === 'image') {
        return (
          <img
            key={index}
            src={item.content}
            loading="lazy"
            alt={post.title}
            style={{ maxWidth: '100%', display: 'block', margin: '8px 0' }}
          />
        );
      }
      if (item.type === 'text') {
        return <p key={index}>{item.content}</p>;
      }
      return null; 
    })}

    <p>{post.likes_count} likes</p>
  </div>
))}

      <div ref={observerTarget} style={{ height: '20px' }}>
        {loadingMore && <p>Loading more...</p>}
      </div>
    </div>
  );
}

export default Feed;