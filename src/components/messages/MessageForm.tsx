import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuthContext } from '../../context/utils/authUtils';
import { PencilIcon } from '@heroicons/react/24/solid';

const MessageForm: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  // Get the user's name from the auth context
  const { displayName } = useAuthContext();
  
  const addMessage = useMutation(api.messages.add);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName || !content.trim()) {
      alert('Please log in and fill in your message');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addMessage({
        author: displayName,
        content: content.trim(),
        imageUrl: imageUrl.trim() || undefined
      });
      
      // Reset form after successful submission
      setContent('');
      setImageUrl('');
      setIsFormVisible(false);
    } catch (err) {
      console.error(err);
      alert('Failed to add message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
    if (e.key === 'Enter' && field !== 'content') {
      e.preventDefault();
      // Get the form element safely
      const form = e.currentTarget.closest('form');
      if (form) {
        const formElements = Array.from(form.elements);
        const index = formElements.indexOf(e.currentTarget);
        if (index !== -1 && index < formElements.length - 1) {
          (formElements[index + 1] as HTMLElement).focus();
        }
      }
    }
  };

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
            className="max-w-md w-full p-6 bg-white rounded-lg shadow-2xl relative" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsFormVisible(false)} 
              className="absolute top-4 left-4 text-book-dark/50 hover:text-book-dark"
              aria-label="סגור"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-4 text-gray-800">השאר ברכה</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  id="author"
                  type="text"
                  value={displayName || ''}
                  disabled={true}
                  placeholder="התחבר כדי להשאיר ברכה"
                  className="input-field"
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
                  className="input-field min-h-[120px] resize-y"
                  disabled={isSubmitting}
                  tabIndex={0}
                  aria-label="Your message"
                  required
                />
              </div>
              
              <div>
                <input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, 'imageUrl')}
                  placeholder="https://example.com/image.jpg"
                  className="input-field"
                  disabled={isSubmitting}
                  tabIndex={0}
                  aria-label="Image URL (optional)"
                />
              </div>
              
              <button
                type="submit"
                className="btn-primary w-full"
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
