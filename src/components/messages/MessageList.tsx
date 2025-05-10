import type { FC } from 'react';
import type { Message } from '../../types';
import MessageCard from './MessageCard';
import BookView from './BookView.tsx';

type MessageListProps = {
  messages: Message[];
  viewMode: 'card' | 'book';
  isAdmin: boolean;
};

const MessageList: FC<MessageListProps> = ({ messages, viewMode, isAdmin }) => {
  return (
    <div>
      {viewMode === 'card' ? (
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageCard 
              key={message._id} 
              message={message} 
              isAdmin={isAdmin}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <BookView messages={messages} isAdmin={isAdmin} />
      )}
    </div>
  );
};

export default MessageList;
