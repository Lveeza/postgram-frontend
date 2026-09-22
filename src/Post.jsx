import { useState } from 'react';
import api from './api';

function Post({ post, onLike, onFollow }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const toggleComments = async () => {
    if (showComments) {
      setShowComments(false); 
      return;
    }

    setLoadingComments(true);
    try {
      const response = await api.get(`/posts/${post.id}/comments`);
      setComments(response.data.data);
      setShowComments(true);
    } catch (err) {
      console.error('Failed to load comments', err);
    } finally {
      setLoadingComments(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
      <p><strong>{post.author.name}</strong> · {post.created_at}</p>

      <button onClick={() => onFollow(post.author.id)}>
        {post.author.is_following ? 'Unfollow' : 'Follow'}
      </button>

      <p>{post.title}</p>
      <p>{post.body}</p>

      {post.media.map((item, index) => {
        if (item.type === 'image') {
          return (
            <img key={index} src={item.content} loading="lazy" alt={post.title}
              style={{ maxWidth: '100%', display: 'block', margin: '8px 0' }} />
          );
        }
        if (item.type === 'text') return <p key={index}>{item.content}</p>;
        return null;
      })}

      <button onClick={() => onLike(post.id)}>
        {post.is_liked_by_user ? '❤️ Liked' : '🤍 Like'} ({post.likes_count})
      </button>

      <button onClick={toggleComments}>
        {showComments ? 'Hide' : 'View'} comments ({post.comments_count ?? 0})
      </button>

      {loadingComments && <p>Loading comments...</p>}

      {showComments && (
        <div style={{ marginLeft: '20px', marginTop: '8px' }}>
          {comments.map((comment) => (
            <p key={comment.id}><strong>{comment.author}</strong>: {comment.content}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default Post;