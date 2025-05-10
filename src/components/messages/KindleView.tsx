import { useState, useCallback, useEffect } from 'react';
import type { FC } from 'react';
import type {
  Message,
  //  Reaction, ReactionWithCount 
} from '../../types';
import { useSwipeable } from 'react-swipeable';
// import { useMutation, useQuery } from 'convex/react';
// import { api } from '../../../convex/_generated/api';
// import { useAuthContext } from '../../context/utils/authUtils';

// Custom hook for window size
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 768,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

type KindleViewProps = {
  messages: Message[];
};

const KindleView: FC<KindleViewProps> = ({ messages }) => {
  const { width } = useWindowSize();
  const isMobile = width <= 768;
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = messages.length + 1; // +1 for first Kindle page

  const handlePrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const handlers = useSwipeable({
    onSwipedLeft: handlePrevPage, // Reversed for Hebrew reading direction
    onSwipedRight: handleNextPage, // Reversed for Hebrew reading direction
    trackMouse: true, // Enable swiping on desktop
  });

  const currentPageMessage = currentPage === 0 ? null : messages[currentPage - 1];

  return (
    <div {...handlers} className="w-full flex justify-center items-center min-h-screen">
      <div className="w-[90%] max-w-[600px] h-[800px] overflow-hidden relative cursor-[grab] hover:cursor-[grab]">
        {/* Kindle-like dark border with more rounded corners */}
        <div className="absolute inset-0 border-[25px] border-b-[70px] bg-[#f6f6f6] border-[#2F2F2F] rounded-[30px] pointer-events-none z-10">

          {/* Kindle text at bottom */}
          <div className="absolute -bottom-12 left-0 right-0 z-20 flex justify-center">
            <span className="text-[#f6f6f6] text-sm font-medium tracking-wide">Kindle</span>
          </div>

          {/* Content Area */}
          <div className="relative z-20 p-5 pb-1 h-full overflow-y-auto flex flex-col justify-between">
            <div className="flex-1">
              {currentPage === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center">
                  <h1 className="text-5xl font-sans font-bold text-gray-800 mb-4">ספר ברכות</h1>
                  <p className="text-gray-600 text-xl">Guestbook Kindle Edition</p>
                </div>
              ) : currentPageMessage ? (
                <div className="h-full pt-8">
                  <h2 className="text-2xl font-sans mb-8 text-gray-800">{currentPageMessage.author}</h2>
                  <p className="text-gray-800 text-md leading-relaxed font-sans text-right">{currentPageMessage.content}</p>
                  
                  {/* Display images from imageUrls array (new format) with Kindle e-ink effect */}
                  {currentPageMessage.imageUrls && currentPageMessage.imageUrls.length > 0 && (
                    <div className="mt-6 mb-4">
                      <div className="flex flex-wrap gap-4 justify-center max-w-full" style={{ margin: '0 auto' }}>
                        {currentPageMessage.imageUrls.map((image, index) => (
                          <div 
                            key={image.storageId} 
                            className="relative rounded-md overflow-hidden bg-gray-100"
                            style={{
                              width: `${isMobile ? 120 : 180}px`,
                              height: `${isMobile ? 120 : 180}px`,
                            }}
                          >
                            <img
                              src={image.url}
                              alt={`Image ${index + 1} shared by ${currentPageMessage.author}`}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                            {/* Kindle e-ink overlay */}
                            <div className="absolute inset-0 bg-gradient-to-b from-gray-200/10 to-gray-300/10 mix-blend-multiply"></div>
                            <div className="absolute inset-0 backdrop-grayscale backdrop-contrast-125 backdrop-brightness-90"></div>
                            <div className="absolute inset-0 bg-[url('/kindle-texture.png')] opacity-5 mix-blend-multiply"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Display legacy imageUrl if no imageUrls array (backward compatibility) */}
                  {!currentPageMessage.imageUrls && currentPageMessage.imageUrl && (
                    <div className="mt-6 mb-4">
                      <img 
                        src={currentPageMessage.imageUrl} 
                        alt={`Image shared by ${currentPageMessage.author}`} 
                        className="max-w-full rounded-md shadow-sm"
                      />
                    </div>
                  )}
                  
                  <div className="mt-6 flex flex-col gap-4">
                    {/* <div className="flex flex-wrap gap-2">
                      {currentPageMessage && <ReactionBar message={currentPageMessage} isAdmin={isAdmin} />}
                    </div> */}
                    {/* <div className="text-right text-sm text-gray-500">
                      <span>{new Date(currentPageMessage.createdAt).toLocaleDateString()}</span>
                    </div> */}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Progress indication with Hebrew page number and percentage */}
            <div className="flex justify-between text-xs text-gray-500">
              <span dir="rtl">{currentPage > 0 ? `עמוד ${currentPage}` : ''}</span>
              {currentPage > 0 && <span>{`${Math.round((currentPage / (totalPages - 1)) * 100)}%`}</span>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// // Reaction bar component for Kindle view
// const ReactionBar: FC<{ message: Message; isAdmin: boolean }> = ({ message }) => {
//   const [showReactionPicker, setShowReactionPicker] = useState(false);
//   const addReaction = useMutation(api.reactions.addReaction);
//   const removeReaction = useMutation(api.reactions.removeReaction);
//   const { user } = useAuthContext();

//   // Get reactions data from Convex with counts
//   const reactions = useQuery(api.reactions.getForMessage, {
//     messageId: message._id,
//     userId: user ? user._id : undefined
//   }) || [];

//   const handleReaction = async (emoji: string) => {
//     try {
//       if (!user) {
//         alert('Please log in to add a reaction');
//         return;
//       }
//       await addReaction({
//         messageId: message._id,
//         emoji,
//         userId: user._id
//       });
//       setShowReactionPicker(false);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Handle removing a reaction
//   const handleRemoveReaction = async (emoji: string) => {
//     try {
//       if (!user) {
//         alert('Please log in to remove a reaction');
//         return;
//       }

//       // Find the user's reaction with this emoji
//       const reactionGroup = reactions.find((r: ReactionWithCount) => r.emoji === emoji);
//       if (!reactionGroup || !reactionGroup.userReacted) return;

//       // Find the specific reaction by this user
//       const userReaction = reactionGroup.reactions.find((r: Reaction) => r.userId === user._id);
//       if (!userReaction) return;

//       await removeReaction({
//         reactionId: userReaction._id,
//         userId: user._id
//       });
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleKeyDown = (callback: () => void) => (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' || e.key === ' ') {
//       callback();
//     }
//   };

//   const emojis = ['❤️', '👍', '🎂', '🎁', '🎉', '🥳', '😊'];

//   return (
//     <div className="flex flex-wrap gap-2">
//       {reactions.map((reactionGroup: ReactionWithCount) => (
//         <button
//           key={reactionGroup.emoji}
//           onClick={() => reactionGroup.userReacted
//             ? handleRemoveReaction(reactionGroup.emoji)
//             : handleReaction(reactionGroup.emoji)
//           }
//           onKeyDown={handleKeyDown(() => reactionGroup.userReacted
//             ? handleRemoveReaction(reactionGroup.emoji)
//             : handleReaction(reactionGroup.emoji)
//           )}
//           className={`
//             rounded-full px-2 py-1 text-sm flex items-center gap-1
//             ${reactionGroup.userReacted
//               ? 'bg-book-accent/20 hover:bg-book-accent/30'
//               : 'bg-book-light hover:bg-book-accent/20'
//             }
//           `}
//           aria-label={`${reactionGroup.emoji} reaction with count ${reactionGroup.count}`}
//           tabIndex={0}
//         >
//           <span>{reactionGroup.emoji}</span>
//           <span className="text-book-dark/70">{reactionGroup.count}</span>
//         </button>
//       ))}

//       <div className="relative">
//         <button
//           onClick={() => setShowReactionPicker(!showReactionPicker)}
//           onKeyDown={handleKeyDown(() => setShowReactionPicker(!showReactionPicker))}
//           className="bg-book-light hover:bg-book-accent/20 rounded-full px-2 py-1 text-sm"
//           aria-label="Add reaction"
//           aria-expanded={showReactionPicker}
//           tabIndex={0}
//         >
//           <span>+</span>
//         </button>

//         {showReactionPicker && (
//           <div className="absolute bottom-full left-0 mb-2 bg-white shadow-lg rounded-md p-2 flex gap-2 z-10">
//             {emojis.map((emoji) => (
//               <button
//                 key={emoji}
//                 onClick={() => handleReaction(emoji)}
//                 onKeyDown={handleKeyDown(() => handleReaction(emoji))}
//                 className="hover:bg-book-light p-1 rounded"
//                 aria-label={`React with ${emoji}`}
//                 tabIndex={0}
//               >
//                 {emoji}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

export default KindleView;
