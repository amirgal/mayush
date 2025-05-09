import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuthContext } from '../../context/utils/authUtils';

const MessageForm = () => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  return (
    <div className="book-page">
      <h2 className="text-2xl font-bold mb-4 text-book-dark">Leave a Birthday Wish</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="author" className="block mb-1 text-book-dark">
            Your Name
          </label>
          <input
            id="author"
            type="text"
            value={displayName || ''}
            disabled={true}
            placeholder="Log in to leave a message"
            className="input-field handwritten"
            tabIndex={0}
            aria-label="Your name (from your profile)"
            required
          />
        </div>
        
        <div>
          <label htmlFor="content" className="block mb-1 text-book-dark">
            Your Message
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your birthday wish here..."
            className="input-field handwritten min-h-[120px] resize-y"
            disabled={isSubmitting}
            tabIndex={0}
            aria-label="Your message"
            required
          />
        </div>
        
        <div>
          <label htmlFor="imageUrl" className="block mb-1 text-book-dark">
            Image URL (optional)
          </label>
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
          {isSubmitting ? 'Sending...' : 'Send Birthday Wish'}
        </button>
      </form>
    </div>
  );
};

export default MessageForm;
