import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuthContext } from '../context/utils/authUtils';
// We don't need to import Message type here as it's used internally by the components
// Use explicit imports to help TypeScript recognize the files

import MessageList from '../components/messages/MessageList';
import Header from '../components/layout/Header';
import useDeviceDetect from '../hooks/useDeviceDetect';

type ViewMode = 'book' | 'kindle';

const GuestbookPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('book');
  const { isAdmin } = useAuthContext();
  const navigate = useNavigate();
  const isMobile = useDeviceDetect();

  // Get messages from Convex database
  const messages = useQuery(api.messages.getAllWithPinnedFirst) || [];

  // No need to import Message type anymore as we're using the Convex API

  const handleToggleView = () => {
    setViewMode((prev) => prev === 'book' ? 'kindle' : 'book');
  };

  const handleAdminPage = () => {
    navigate('/admin');
  };

  return (
    <div className="flex flex-col h-screen">
      <Header
        isAdmin={isAdmin}
        onAdminClick={handleAdminPage}
        viewMode={viewMode}
        onToggleView={handleToggleView}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className={`container mx-auto px-2 overflow-y-auto ${isMobile ? 'pt-4 max-h-[90vh]' : 'pt-8'} pb-8 h-full flex flex-col [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}>
          <div className="flex-1 flex flex-col min-h-0">
            <MessageList
              messages={messages}
              viewMode={viewMode}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default GuestbookPage;
