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
  if (messages.length === 0) {
    return (
      <div className="book-page text-center py-8">
        <p className="text-book-dark/70 handwritten text-xl">No messages yet. Be the first to leave a birthday wish!</p>
      </div>
    );
  }

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
