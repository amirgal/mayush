import { type FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Icons as text components
const CheckCircle = () => (
  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
    <span className="text-lg">✓</span>
  </span>
);

type InfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const InfoModal: FC<InfoModalProps> = ({ isOpen, onClose }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label="Close modal"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10 p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 w-10 h-10 flex items-center justify-center"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-book-dark mb-2">למאיה יש יום הולדת!</h2>
                <p className="text-gray-600">אנחנו כאן כדי לברך אותה, הנה איך לעשות את זה</p>
              </div>
              
              <div className="space-y-5">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <CheckCircle />
                  <div>
                    <h3 className="font-medium text-book-dark text-right">שמרו על זה בסוד!</h3>
                    <p className="text-gray-600 mt-1 text-right">
                      בכדי שנוכל להפתיע אותה, חשוב שהיא לא תדע על זה.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <CheckCircle />
                  <div>
                    <h3 className="font-medium text-book-dark text-right">לחצו על ברכה חדשה</h3>
                    <p className="text-gray-600 mt-1 text-right">
                      הכפתור נמצא בראש העמוד מצד ימין.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <CheckCircle />
                  <div>
                    <h3 className="font-medium text-book-dark text-right">ברכו אותה מכל הלב!</h3>
                    <p className="text-gray-600 mt-1 text-right">
                      תכתבו את שמכם וברכו את מאיה באיזו צורה שתרצו.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <CheckCircle />
                  <div>
                    <h3 className="font-medium text-book-dark text-right">הוסיפו תמונות (אופציונלי)</h3>
                    <p className="text-gray-600 mt-1 text-right">
                      הוסיפו תמונות שישמחו אותה. תמונות שלכם ביחד עדיפות (עד 3 תמונות לברכה).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <CheckCircle />
                  <div>
                    <h3 className="font-medium text-book-dark text-right">שלחו לה את הברכה</h3>
                    <p className="text-gray-600 mt-1 text-right">
                      לחצו על כפתור השליחה כדי להוסיף את הברכה לספר.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InfoModal;
