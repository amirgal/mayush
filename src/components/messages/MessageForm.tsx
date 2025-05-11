import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

import { useAuthContext } from '../../context/utils/authUtils';
import { PencilIcon } from '@heroicons/react/24/solid';
import FileUpload from '../ui/FileUpload';
import type { ImageAttachment } from '../../types';

type MessageFormProps = {
  viewMode: 'book' | 'kindle';
};


const MessageForm: React.FC<MessageFormProps> = ({ viewMode }) => {
  const [content, setContent] = useState<string>('');
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  // Get the user's name and ID from the auth context
  const { displayName, user } = useAuthContext();
  
  const addMessage = useMutation(api.messages.add);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName || !content.trim() || !user) {
      alert('Please log in and fill in your message');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addMessage({
        author: displayName,
        content: content.trim(),
        imageUrls: images.length > 0 ? images.map(({ storageId, url }) => ({ storageId, url })) : undefined,
        userId: user._id
      });
      
      // Reset form after successful submission
      setContent('');
      setImages([]);
      setIsFormVisible(false);
    } catch (err) {
      console.error(err);
      alert('Failed to add message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // No longer needed since we're using FileUpload component instead of input fields

  const toggleForm = () => {
    setIsFormVisible(!isFormVisible);
  };

  return (
    <>
      {/* Floating Add Page Button */}
      <button 
        onClick={toggleForm}
        className="fixed bottom-6 right-6 bg-book-dark text-white p-4 rounded-full shadow-2xl hover:bg-book-accent transition-colors duration-300 z-50 flex items-center justify-center"
        aria-label="הוסף ברכה"
      >
        <PencilIcon className="h-6 w-6" />
        <span className="mr-2 hidden md:inline">הוסף ברכה</span>
      </button>

      {isFormVisible && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center" onClick={() => setIsFormVisible(false)}>
          <div 
            className={`max-w-md w-full relative ${
              viewMode === 'kindle' 
                ? 'bg-[#f6f6f6] rounded-lg p-6 shadow-xl' 
                : 'bg-book-light p-8 rounded-lg shadow-2xl border-2 border-book-accent/20'
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <button 
              onClick={() => setIsFormVisible(false)} 
              className="absolute top-4 left-4 text-book-dark/50 hover:text-book-dark"
              aria-label="סגור"
            >
              ✕
            </button>

            <h2 className={`text-2xl font-bold mb-4 ${viewMode === 'kindle' ? 'text-gray-800' : 'text-book-dark'}`}>
              {viewMode === 'kindle' ? 'New Message' : 'הוסף ברכה'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  id="author"
                  type="text"
                  value={displayName || ''}
                  disabled={true}
                  placeholder="התחבר כדי להשאיר ברכה"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
                    viewMode === 'kindle' 
                      ? 'bg-[#f6f6f6] border-gray-300 focus:border-gray-500' 
                      : 'bg-white border-book-accent/30 focus:border-book-accent'
                  }`}
                  tabIndex={0}
                  aria-label="Your name (from your profile)"
                  required
                />
              </div>
              
              <div>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="כתוב את הברכה שלך כאן..."
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none min-h-[120px] resize-y ${
                    viewMode === 'kindle' 
                      ? 'bg-[#f6f6f6] border-gray-300 focus:border-gray-500 text-right' 
                      : 'bg-white border-book-accent/30 focus:border-book-accent text-right'
                  }`}
                  disabled={isSubmitting}
                  tabIndex={0}
                  aria-label="Your message"
                  required
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  viewMode === 'kindle' ? 'text-gray-700' : 'text-book-dark/80'
                }`}>
                  Images (optional)
                </label>
                <FileUpload
                  onImagesChange={setImages}
                  disabled={isSubmitting}
                  maxFiles={3}
                  maxSizeMB={5}
                />
              </div>
              
              <button
                type="submit"
                className={`w-full py-2 px-4 font-medium rounded-md transition-colors ${
                  viewMode === 'kindle'
                    ? 'bg-gray-800 text-white hover:bg-gray-700'
                    : 'bg-book-accent text-white hover:bg-book-dark'
                }`}
                disabled={isSubmitting}
                tabIndex={0}
              >
                {isSubmitting ? 'שולח...' : 'שלח ברכה'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageForm;
