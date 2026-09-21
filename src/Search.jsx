import { useState, useEffect } from 'react';
import api from './api';

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const timerId = setTimeout(async () => {
      const response = await api.get(`/posts?search=${query}`);
      setResults(response.data.data);
    }, 400);

    return () => clearTimeout(timerId); 
    
  }, [query]); 

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search posts..."
      />
      {results.map((post) => (
        <p key={post.id}>{post.title}</p>
      ))}
    </div>
  );
}

export default Search;