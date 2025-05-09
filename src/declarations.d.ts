// This file contains type declarations for our components to help TypeScript

// Declare modules for our components
declare module '*/components/messages/MessageForm' {
  import { FC } from 'react';
  const MessageForm: FC;
  export default MessageForm;
}

declare module '*/components/messages/MessageList' {
  import { FC } from 'react';
  import { Message } from '../types';
  
  interface MessageListProps {
    messages: Message[];
    viewMode: 'card' | 'book';
    isAdmin: boolean;
  }
  
  const MessageList: FC<MessageListProps>;
  export default MessageList;
}

declare module '*/components/messages/BookView' {
  import { FC } from 'react';
  import { Message } from '../types';
  
  interface BookViewProps {
    messages: Message[];
    isAdmin: boolean;
  }
  
  const BookView: FC<BookViewProps>;
  export default BookView;
}

declare module '*/components/layout/Header' {
  import { FC } from 'react';
  
  interface HeaderProps {
    isAdmin: boolean;
    viewMode: 'card' | 'book';
    isAdminPage?: boolean;
    onAdminClick: () => void;
    onLogout: () => void;
    onToggleView: () => void;
  }
  
  const Header: FC<HeaderProps>;
  export default Header;
}
