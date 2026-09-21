import { useState } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
    const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError(''); 

    try {
      const response = await api.post('/login', { email, password });
      const token = response.data.access_token; 
      localStorage.setItem('token', token);
      navigate('/feed');    
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };
    return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Log In</button>
    </form>
  );
}

export default Login;