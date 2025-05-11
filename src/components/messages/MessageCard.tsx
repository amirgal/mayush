import { useState } from 'react';
import type { FC } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Message, Reaction, ReactionWithCount } from '../../types';
import { useAuthContext } from '../../context/utils/authUtils';

type MessageCardProps = {
  message: Message;
  isAdmin: boolean;
};

const MessageCard: FC<MessageCardProps> = ({ message, isAdmin }) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const togglePin = useMutation(api.messages.togglePin);
  const addReaction = useMutation(api.reactions.addReaction);
  const removeReaction = useMutation(api.reactions.removeReaction);

  const { user } = useAuthContext();

  // Get reactions data from Convex with counts
  const reactions = useQuery(api.reactions.getForMessage, {
    messageId: message._id,
    userId: user ? user._id : undefined,
  }) || [];

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
      if (!user) {
        alert('Please log in to add a reaction');
        return;
      }
      await addReaction({
        messageId: message._id,
        emoji,
        userId: user._id,
      });
      setShowReactionPicker(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle removing a reaction
  const handleRemoveReaction = async (emoji: string) => {
    try {
      if (!user) {
        alert('Please log in to remove a reaction');
        return;
      }

      // Find the user's reaction with this emoji
      const reactionGroup = reactions.find((r: ReactionWithCount) => r.emoji === emoji);
      if (!reactionGroup || !reactionGroup.userReacted) return;

      // Find the specific reaction by this user
      const userReaction = reactionGroup.reactions.find((r: Reaction) => r.userId === user._id);
      if (!userReaction) return;

      await removeReaction({
        reactionId: userReaction._id,
        userId: user._id,
      });
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

  const cardClassName = 'w-full h-full';

  return (
    <div className={`${cardClassName} flex flex-col`}>
      <div className="flex justify-between items-start mb-4 pb-2 border-b border-book-dark/10">
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <button
              onClick={handleTogglePin}
              onKeyDown={handleKeyDown(handleTogglePin)}
              className={`
                flex items-center text-xs px-2 py-1 rounded-md
                ${message.isPinned 
                  ? 'bg-book-accent/20 text-book-dark hover:bg-book-accent/30' 
                  : 'text-book-dark/60 hover:text-book-dark'
                }
              `}
              aria-label={message.isPinned ? 'Unpin message' : 'Pin message'}
              tabIndex={0}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 ml-1" 
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
                />
              </svg>
              {message.isPinned ? 'Pinned' : 'Pin'}
            </button>
          ) : message.isPinned ? (
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
          ) : null}
        </div>
        <div className="text-book-dark/60 text-sm">{formattedDate}</div>
      </div>
      <h3 className="font-bold text-lg text-book-dark">{message.author}</h3>
      
      <div className="handwritten text-lg leading-relaxed mb-4 whitespace-pre-wrap">{message.content}</div>
      
      {/* Display images from imageUrls array (new format) */}
      {message.imageUrls && message.imageUrls.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-4 justify-center">
          {message.imageUrls.map((image, index) => {
            // Generate a random slight rotation between -5 and 5 degrees for the polaroid effect
            const randomRotation = Math.floor(Math.random() * 11) - 5;
            
            return (
              <div 
                key={image.storageId} 
                className="polaroid-image bg-white p-2 pb-8 shadow-md max-w-[200px] relative"
                style={{ 
                  transform: `rotate(${randomRotation}deg)`,
                  transition: 'transform 0.3s ease'
                }}
              >
                <div className="overflow-hidden">
                  <img
                    src={image.url}
                    alt={`Image ${index + 1} shared by ${message.author}`}
                    className="w-full h-[150px] object-cover"
                  />
                </div>
                <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-gray-500 font-handwritten">
                  {new Date(message.createdAt).toLocaleDateString('he-IL', {month: 'short', year: 'numeric'})}
                </div>
                {/* Tape effect at the top */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-gray-200/70 rounded-sm rotate-1"></div>
              </div>
            );
          })}
        </div>
      )}
      <div className="flex justify-between items-center mt-auto pt-2 pb-4 border-t border-book-dark/10">
        <div className="flex flex-wrap gap-2">
          {reactions.map((reactionGroup: ReactionWithCount) => (
            <button
              key={reactionGroup.emoji}
              onClick={() => reactionGroup.userReacted 
                ? handleRemoveReaction(reactionGroup.emoji) 
                : handleReaction(reactionGroup.emoji)
              }
              onKeyDown={handleKeyDown(() => reactionGroup.userReacted 
                ? handleRemoveReaction(reactionGroup.emoji) 
                : handleReaction(reactionGroup.emoji)
              )}
              className={`
                rounded-full px-2 py-1 text-sm flex items-center gap-1
                ${reactionGroup.userReacted 
                  ? 'bg-book-accent/20 hover:bg-book-accent/30' 
                  : 'bg-book-light hover:bg-book-accent/20'
                }
              `}
              aria-label={`${reactionGroup.emoji} reaction with count ${reactionGroup.count}`}
              tabIndex={0}
            >
              <span>{reactionGroup.emoji}</span>
              <span className="text-book-dark/70">{reactionGroup.count}</span>
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
      </div>
    </div>
  );
};

export default MessageCard;
