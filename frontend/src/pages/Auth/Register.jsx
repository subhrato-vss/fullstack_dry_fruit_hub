import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
        await api.post('/auth/register', formData);
        navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err) {
        setError(err.response?.data?.message || 'Registration failed');
        setLoading(false);
    }
  };

  return (
    <div className="container animate-fade" style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
      <div className="auth-card glass" style={{ padding: '50px', width: '100%', maxWidth: '450px', borderRadius: '30px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Join the Hub</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px' }}>Get access to our finest dry fruit collections</p>

        {error && <div className="error-alert" style={{ marginBottom: '20px' }}>{error}</div>}

        <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={handleSubmit}>
          <div className="field">
            <label>Full Name</label>
            <input 
                type="text" 
                name="name"
                placeholder="e.g. John Doe" 
                value={formData.name}
                onChange={handleChange}
                required
            />
          </div>
          <div className="field">
            <label>Email Address</label>
            <input 
                type="email" 
                name="email"
                placeholder="name@example.com" 
                value={formData.email}
                onChange={handleChange}
                required
            />
          </div>
          <div className="field">
            <label>Phone Number</label>
            <input 
                type="text" 
                name="phone"
                placeholder="+91 00000 00000" 
                value={formData.phone}
                onChange={handleChange}
                required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input 
                type="password" 
                name="password"
                placeholder="At least 6 characters" 
                value={formData.password}
                onChange={handleChange}
                required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
