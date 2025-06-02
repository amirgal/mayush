import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { FC } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Message, Reaction, ReactionWithCount } from '../../types';
import { useAuthContext } from '../../context/utils/authUtils';
import ImageModal from '../ui/ImageModal';
import ConfirmationDialog from '../ui/ConfirmationDialog';

type MessageCardProps = {
  message: Message;
  isAdmin: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

const MessageCard: FC<MessageCardProps> = ({ message, isAdmin, onEdit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
const [pickerTop, setPickerTop] = useState<number | null>(null);
const [pickerLeft, setPickerLeft] = useState<number | null>(null);
const [isMobile, setIsMobile] = useState<boolean>(false);
const reactionButtonRef = useRef<HTMLButtonElement | null>(null);
const pickerRef = useRef<HTMLDivElement | null>(null);

// Calculate both vertical and horizontal position responsively
useEffect(() => {
  if (showReactionPicker && reactionButtonRef.current) {
    const rect = reactionButtonRef.current.getBoundingClientRect();
    const mobile = window.innerWidth < 640;
    setIsMobile(mobile);
    setPickerTop(rect.top - 56); // 56px above the button, adjust as needed
    if (!mobile) {
      setPickerLeft(rect.left);
    } else {
      setPickerLeft(null);
    }
  } else {
    setPickerTop(null);
    setPickerLeft(null);
    setIsMobile(false);
  }
}, [showReactionPicker]);

useEffect(() => {
  if (!showReactionPicker) return;
  const handleClickOutside = (event: MouseEvent) => {
    const picker = pickerRef.current;
    const button = reactionButtonRef.current;
    if (
      picker &&
      !picker.contains(event.target as Node) &&
      button &&
      !button.contains(event.target as Node)
    ) {
      setShowReactionPicker(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [showReactionPicker]);
  const [selectedImage, setSelectedImage] = useState<{ url: string; altText: string } | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

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
    }
  };

  const handleReaction = async (emoji: string) => {
    try {
      if (!user) {
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

  const handleKeyDown = (callback: (e?: React.KeyboardEvent) => void) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      callback(e);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete?.();
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleImageLoad = (imageUrl: string) => {
    setLoadedImages(prev => new Set([...prev, imageUrl]));
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
          <div className="flex items-center gap-1">
        {onEdit && (
          <button
            onClick={onEdit}
            onKeyDown={handleKeyDown(onEdit)}
            className="text-book-dark/60 hover:text-book-dark p-1 rounded-full hover:bg-book-light/50 transition-colors"
            aria-label="Edit message"
            tabIndex={0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            onClick={handleDeleteClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const mouseEvent = new MouseEvent('click') as unknown as React.MouseEvent;
                handleDeleteClick(mouseEvent);
              }
            }}
            className="text-red-500/70 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
            aria-label="Delete message"
            tabIndex={0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
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
      <h3 className="font-bold text-lg text-book-dark mb-2">{message.author}</h3>
      
      <div className="text-lg leading-relaxed mb-4 whitespace-pre-wrap">{message.content}</div>
      
      {/* Display images from imageUrls array (new format) */}
      {message.imageUrls && message.imageUrls.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-4 justify-center">
          {message.imageUrls.map((image, index) => {
            // Generate a random slight rotation between -5 and 5 degrees for the polaroid effect
            const randomRotation = Math.floor(Math.random() * 11) - 5;
            const isLoaded = loadedImages.has(image.url);
            
            return (
              <div 
                key={image.storageId} 
                className="polaroid-image bg-white p-2 pb-8 shadow-md max-w-[200px] relative cursor-pointer
                         hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out"
                style={{ 
                  transform: `rotate(${randomRotation}deg)`,
                  transition: 'transform 0.3s ease'
                }}
                onClick={() => setSelectedImage({
                  url: image.url,
                  altText: `Image ${index + 1} shared by ${message.author}`
                })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedImage({
                      url: image.url,
                      altText: `Image ${index + 1} shared by ${message.author}`
                    });
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View enlarged image ${index + 1} shared by ${message.author}`}
              >
                <div className="overflow-hidden relative min-w-[150px] min-h-[150px]">
                  {!isLoaded && (
                    <div
                      className="absolute inset-0 bg-black/50 animate-bg-black-to-white"
                      aria-label="Image loading background transition"
                      tabIndex={0}
                    />
                  )}
                  <img
                    src={image.url}
                    alt={`Image ${index + 1} shared by ${message.author}`}
                    className={`w-full h-[150px] object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => handleImageLoad(image.url)}
                  />
                </div>
                {/* <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-gray-500 font-handwritten">
                  {new Date(message.createdAt).toLocaleDateString('he-IL', {month: 'short', year: 'numeric'})}
                </div> */}
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
              ref={reactionButtonRef}
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              onKeyDown={handleKeyDown(() => setShowReactionPicker(!showReactionPicker))}
              className="bg-book-light hover:bg-book-accent/20 rounded-full px-2 py-1 text-sm"
              aria-label="Add reaction"
              aria-expanded={showReactionPicker}
              tabIndex={0}
            >
              <span>+</span>
            </button>
            {showReactionPicker && pickerTop !== null &&
              createPortal(
                <div
                  ref={pickerRef}
                  className="fixed z-[9999] bg-white shadow-lg rounded-md p-2 flex gap-2 max-w-xs sm:max-w-sm px-2"
                  style={{
                    top: pickerTop,
                    left: isMobile ? '50%' : pickerLeft ?? 0,
                    transform: isMobile ? 'translateX(-50%)' : undefined,
                  }}
                >
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
                </div>,
                document.body
              )
            }
          </div>
        </div>
      </div>
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage.url}
          altText={selectedImage.altText}
          onClose={() => setSelectedImage(null)}
        />
      )}
      
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="מחיקת הודעה"
        message="האם אתה בטוח שברצונך למחוק הודעה זו? פעולה זו לא ניתנת לביטול."
        confirmText="מחק"
        cancelText="ביטול"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default MessageCard;
