import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/utils/authUtils';
import { useConvexAuth } from '../hooks/useConvexAuth';
import type { Id } from '../../convex/_generated/dataModel';

const LoginPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthContext();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/guestbook');
    }
  }, []);
  
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
    
    if (!isLoginMode && !displayName.trim()) {
      setError('Please enter your display name');
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
          console.log(result);
          
          // For login, we need to get the user's name from the database
          setAuth(result.userId as Id<"users">, username, result.displayName, result.isAdmin);
          navigate('/guestbook');
        } else {
          setError(result.message || 'Invalid credentials. Please try again.');
        }
      } else {
        // Register using our custom hook
        const result = await register(
          username,
          displayName,
          password, 
        );
        
        if (result.success) {
          // Auto-login after successful registration
          const loginResult = await login(username, password);
          
          if (loginResult.success) {
            setAuth(loginResult.userId as Id<"users">, username, loginResult.displayName, loginResult.isAdmin);
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
      setDisplayName('');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-book-light p-4">
      <div className="bg-white/90 shadow-2xl rounded-xl max-w-md w-full p-10 border border-book-dark/10">
        <h1 className="text-3xl font-bold text-center mb-6 text-book-dark">TESTBOOK</h1>
        <p className="text-center mb-8 text-book-dark/70 text-xl">{isLoginMode ? 'Please log in to continue' : 'Create a new account'}</p>
        
        <div className="mb-4">
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            placeholder="Username"
            className="w-full px-3 py-2 border border-book-dark/10 bg-white/50 rounded-md focus:outline-none focus:ring-2 focus:ring-book-accent/50"
            aria-label="Username input"
            tabIndex={0}
          />
        </div>
        
        {!isLoginMode && (
          <div className="mb-4">
            <input
              id="name"
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setError('');
              }}
              placeholder="Display Name"
              className="w-full px-3 py-2 border border-book-dark/5 bg-white/90 rounded-md focus:outline-none focus:ring-2 focus:ring-book-accent/50"
              aria-label="Display name input"
              tabIndex={0}
            />
          </div>
        )}
        
        <div className="mb-6">
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="Password"
            className="w-full px-3 py-2 border border-book-dark/10 bg-white/50 rounded-md focus:outline-none focus:ring-2 focus:ring-book-accent/50"
            aria-label="Password input"
            tabIndex={0}
          />
          {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
        </div>
        
        <button 
          onClick={handleSubmit}
          className="w-full py-3 bg-book-dark text-white rounded-md hover:bg-book-accent transition-colors duration-300 mb-4"
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
