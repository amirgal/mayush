import type { FC } from 'react';
import type { Message } from '../../types';
import BookView from './BookView.tsx';
import KindleView from './KindleView';

type MessageListProps = {
  messages: Message[];
  viewMode: 'book' | 'kindle';
  isAdmin: boolean;
};

const MessageList: FC<MessageListProps> = ({ messages, viewMode, isAdmin }) => {
  return (
    <div>
      {viewMode === 'book' ? (
        <BookView messages={messages} isAdmin={isAdmin} />
      ) : (
        <KindleView messages={messages} />
      )}
    </div>
  );
};

export default MessageList;
