import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authUtils';
import { useConvexAuth } from '../hooks/useConvexAuth';

const LoginPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  
  // Use our custom hook for Convex authentication
  const { login, register } = useConvexAuth();
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (!isLoginMode && !name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }
    
    try {
      if (isLoginMode) {
        // Login using our custom hook
        const result = await login(username, password);
        
        if (result.success) {
          // For login, we need to get the user's name from the database
          // For simplicity, we'll use the username as the display name if we don't have it
          setAuth(username, username, result.isAdmin);
          navigate('/guestbook');
        } else {
          setError(result.message || 'Invalid credentials. Please try again.');
        }
      } else {
        // Register using our custom hook
        const result = await register(
          username,
          name,
          password, 
          false, // Regular users aren't admins
          false  // This isn't an admin creating the user
        );
        
        if (result.success) {
          // Auto-login after successful registration
          const loginResult = await login(username, password);
          
          if (loginResult.success) {
            setAuth(username, name, loginResult.isAdmin);
            navigate('/guestbook');
          } else {
            setError('Registration successful. Please log in.');
            setIsLoginMode(true);
          }
        } else {
          setError(result.message || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
  };
  
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    if (isLoginMode) {
      // Switching to register mode, reset fields
      setUsername('');
      setName('');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-book-light">
      <div className="book-page max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-book-dark">TESTBOOK</h1>
        <p className="text-center mb-8 handwritten text-xl">{isLoginMode ? 'Please log in to continue' : 'Create a new account'}</p>
        
        <div className="mb-4">
          <label htmlFor="username" className="block mb-1 text-book-dark">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            placeholder="Enter username"
            className="input-field"
            aria-label="Username input"
            tabIndex={0}
          />
        </div>
        
        {!isLoginMode && (
          <div className="mb-4">
            <label htmlFor="name" className="block mb-1 text-book-dark">Display Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Enter your name"
              className="input-field"
              aria-label="Display name input"
              tabIndex={0}
            />
          </div>
        )}
        
        <div className="mb-6">
          <label htmlFor="password" className="block mb-1 text-book-dark">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter password"
            className="input-field"
            aria-label="Password input"
            tabIndex={0}
          />
          {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
        </div>
        
        <button 
          onClick={handleSubmit}
          className="btn-primary w-full mb-4"
          tabIndex={0}
        >
          {isLoginMode ? 'Log In' : 'Register'}
        </button>
        
        <div className="text-center mt-4">
          <button 
            onClick={toggleMode}
            className="text-book-dark/60 hover:text-book-dark text-sm underline"
            tabIndex={0}
          >
            {isLoginMode ? 'Need an account? Register' : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
