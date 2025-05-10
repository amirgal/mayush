import { useState } from 'react';
import type { FC } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Message, Reaction } from '../../types';
import type { Id } from '../../../convex/_generated/dataModel';

type MessageCardProps = {
  message: Message;
  isAdmin: boolean;
  viewMode: 'card' | 'book';
};

const MessageCard: FC<MessageCardProps> = ({ message, isAdmin, viewMode }) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  
  const togglePin = useMutation(api.messages.togglePin);
  const addReaction = useMutation(api.reactions.addReaction);
  const removeReaction = useMutation(api.reactions.removeReaction);
  // Get reactions data from Convex
  const reactions = useQuery(api.reactions.getForMessage, { messageId: message._id }) || [];
  
  const handleTogglePin = async () => {
    try {
      await togglePin({ messageId: message._id, isAdmin });
    } catch (err) {
      console.error(err);
      alert('Failed to toggle pin status');
    }
  };
  
  const handleReaction = async (emoji: string) => {
    try {
      await addReaction({ messageId: message._id, emoji });
      setShowReactionPicker(false);
    } catch (err) {
      console.error(err);
    }
  };
  
  // Use proper typing for the reaction ID
  const handleRemoveReaction = async (reactionId: Id<'reactions'>) => {
    try {
      await removeReaction({ reactionId });
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleKeyDown = (callback: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      callback();
    }
  };
  
  const emojis = ['❤️', '👍', '🎂', '🎁', '🎉', '🥳', '😊'];
  
  const formattedDate = new Date(message.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const cardClassName = viewMode === 'card' 
    ? 'message-card' 
    : 'w-full h-full';

  return (
    <div className={cardClassName}>
      <div className={`flex justify-between items-start mb-4 ${viewMode === 'book' ? 'pb-2 border-b border-book-dark/10' : ''}`}>
        <div className="flex flex-col items-start gap-2">
          {message.isPinned && (
            <div className="bg-book-accent/20 text-book-dark px-2 py-1 rounded-md text-xs inline-block">
              <span className="flex items-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-3 w-3 ml-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
                  />
                </svg>
                Pinned
              </span>
            </div>
          )}
        </div>
        <div className="text-book-dark/60 text-sm">{formattedDate}</div>
      </div>
      <h3 className="font-bold text-lg text-book-dark">{message.author}</h3>
      
      <div className={`${viewMode === 'book' ? 'handwritten text-lg leading-relaxed' : 'text-lg'} mb-4 whitespace-pre-wrap`}>{message.content}</div>
      
      {message.imageUrl && (
        <div className="mb-4">
          <img 
            src={message.imageUrl} 
            alt={`Image shared by ${message.author}`} 
            className="max-w-full rounded-md shadow-sm"
          />
        </div>
      )}
      
      <div className="flex justify-between items-center mt-4 pt-2 border-t border-book-dark/10">
        <div className="flex flex-wrap gap-2">
          {reactions.map((reaction: Reaction) => (
            <button
              key={reaction._id}
              onClick={() => handleRemoveReaction(reaction._id)}
              onKeyDown={handleKeyDown(() => handleRemoveReaction(reaction._id))}
              className="bg-book-light hover:bg-book-accent/20 rounded-full px-2 py-1 text-sm flex items-center"
              aria-label={`${reaction.emoji} reaction with count ${reaction.count}`}
              tabIndex={0}
            >
              <span className="ml-1">{reaction.emoji}</span>
              <span className="text-book-dark/70">{reaction.count}</span>
            </button>
          ))}
          
          <div className="relative">
            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              onKeyDown={handleKeyDown(() => setShowReactionPicker(!showReactionPicker))}
              className="bg-book-light hover:bg-book-accent/20 rounded-full px-2 py-1 text-sm"
              aria-label="Add reaction"
              aria-expanded={showReactionPicker}
              tabIndex={0}
            >
              <span>+</span>
            </button>
            
            {showReactionPicker && (
              <div className="absolute bottom-full left-0 mb-2 bg-white shadow-lg rounded-md p-2 flex gap-2 z-10">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    onKeyDown={handleKeyDown(() => handleReaction(emoji))}
                    className="hover:bg-book-light p-1 rounded"
                    aria-label={`React with ${emoji}`}
                    tabIndex={0}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {isAdmin && (
          <button
            onClick={handleTogglePin}
            onKeyDown={handleKeyDown(handleTogglePin)}
            className={`text-sm ${message.isPinned ? 'text-book-accent' : 'text-book-dark/60'} hover:text-book-dark`}
            aria-label={message.isPinned ? 'Unpin message' : 'Pin message'}
            tabIndex={0}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageCard;
