import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuthContext } from '../context/utils/authUtils';
// We don't need to import Message type here as it's used internally by the components
// Use explicit imports to help TypeScript recognize the files
import MessageForm from '../components/messages/MessageForm';
import MessageList from '../components/messages/MessageList';
import Header from '../components/layout/Header';

type ViewMode = 'card' | 'book';

const GuestbookPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const { username, isAdmin, isAuthenticated, logout } = useAuthContext();
  const navigate = useNavigate();
  
  // Use username for personalized welcome message
  const welcomeMessage = username ? `ברוך הבא, ${username}!` : 'ברוכים הבאים לספר הברכות!';
  // Get messages from Convex database
  const messages = useQuery(api.messages.getAllWithPinnedFirst) || [];
  
  // No need to import Message type anymore as we're using the Convex API
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const handleToggleView = () => {
    setViewMode(prev => prev === 'card' ? 'book' : 'card');
  };
  
  const handleAdminPage = () => {
    navigate('/admin');
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-book-light">
      <Header 
        isAdmin={isAdmin} 
        onAdminClick={handleAdminPage} 
        onLogout={handleLogout} 
        viewMode={viewMode}
        onToggleView={handleToggleView}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-2">
          <p className="text-lg text-book-dark/80">{welcomeMessage}</p>
        </div>
        <h1 className="text-4xl font-bold text-center mb-8 text-book-dark handwritten">
          !יום הולדת שמח
        </h1>
        
        <MessageForm />
        
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-book-dark">
            ברכות ואיחולים
          </h2>
          
          <MessageList 
            messages={messages} 
            viewMode={viewMode} 
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </div>
  );
};

export default GuestbookPage;
