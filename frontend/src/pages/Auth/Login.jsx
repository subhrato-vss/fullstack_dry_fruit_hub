import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
        await loginUser(email, password);
        navigate(from, { replace: true });
    } catch (err) {
        setError(err.response?.data?.message || 'Invalid email or password');
        setLoading(false);
    }
  };

  return (
    <div className="container animate-fade" style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
      <div className="auth-card glass" style={{ padding: '50px', width: '100%', maxWidth: '450px', borderRadius: '30px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px' }}>Sign in to access your premium account</p>
        
        {error && <div className="error-alert" style={{ marginBottom: '20px' }}>{error}</div>}
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={handleSubmit}>
          <div className="field">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
          </div>
          <div className="field">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
