import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import '../styles/Login.css';
import Alert from 'react-bootstrap/Alert';

const Login = () => {

  const [show, setShow] = useState(false);
  const [alertMessage, setAlertMessage] = useState();
  const [variant, setVariant] = useState();

  useEffect(() => {
    // Add class to the body tag for this page
    document.body.classList.add('login-container-body');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');
    localStorage.removeItem('designation');
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
        localStorage.setItem('userId' , response.UserId);
        localStorage.setItem('role', response.Role);
        localStorage.setItem('userName', response.UserName);
        localStorage.setItem('designation', response.Designation);
        if(response.Role === "ADMIN"){
          navigate('/admin');
        }else{
          navigate('/user');
        }        
      } else {
        handleAlertDisplay("Login failed. Invalid credentials.","danger");
      }
    } catch (error) {
      handleAlertDisplay("Error logging in. Please try again later.","danger");
    }
  };

  const handleAlertDisplay = (message,variant) => {
    setVariant(variant);
    setAlertMessage(message);
    setShow(true);
    setTimeout(() => {
      setShow(false)
    }, 5000);
  }


  return (
    <div className="login-container">
      <div className="login-card">
          <Alert show={show} key={variant} variant={variant} onClose={() => setShow(false)} dismissible>
                 <b>{alertMessage}</b></Alert>
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
        <button className="login-button" title="Sign In" onClick={handleLogin}>Log In</button>
      </div>
    </div>
  );
};

export default Login;