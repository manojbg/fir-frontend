import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import '../styles/Login.css';

const Login = () => {

  useEffect(() => {
    // Add class to the body tag for this page
    document.body.classList.add('login-container-body');
  
    // Cleanup by removing the class when the component unmounts
    return () => {
      document.body.classList.remove('login-container-body');
    };
  }, []);

  const [credentials, setCredentials] = useState({
    userId: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleLogin = async () => {
    try {
      const userDetails = {
        userId: credentials.userId,
        password: credentials.password,
        userName: '',
        role: ''
      };

      const response = await apiService.login(userDetails);

      if (response && response.Role) {
        alert(`Welcome ${response.UserName || 'User'}, Role: ${response.Role}`);
        navigate('/admin');
      } else {
        alert('Login failed. Invalid credentials.');
      }
    } catch (error) {
      alert('Error logging in. Please try again later.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title"></h1>
        <input
          type="text"
          name="userId"
          className="login-input"
          placeholder="User ID"
          value={credentials.userId}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          className="login-input"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
        />
        <button className="login-button" onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
};

export default Login;
