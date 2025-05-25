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
              className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors p-2 -ml-2 rounded-full hover:bg-gray-100"
              aria-label="Close modal"
            >
              <span className="text-lg font-bold">X</span>
            </button>
            
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-book-dark mb-2">הוראות הוספת הודעה</h2>
                <p className="text-gray-600">כל מה שצריך לדעת כדי להוסיף ברכה לספר האורחים</p>
              </div>
              
              <div className="space-y-5">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <CheckCircle />
                  <div>
                    <h3 className="font-medium text-book-dark">לחצו על כפתור "הוסף הודעה"</h3>
                    <p className="text-gray-600 mt-1 text-right">
                      הכפתור ממוקם בפינה השמאלית העליונה של הדף
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <CheckCircle />
                  <div>
                    <h3 className="font-medium text-book-dark">מלאו את פרטי ההודעה</h3>
                    <p className="text-gray-600 mt-1 text-right">
                      הכניסו את שמכם ואת ברכתכם האישית בטופס שיופיע
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <CheckCircle />
                  <div>
                    <h3 className="font-medium text-book-dark">הוסיפו תמונות (אופציונלי)</h3>
                    <p className="text-gray-600 mt-1 text-right">
                      ניתן לצרף תמונות לברכה שלכם
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <CheckCircle />
                  <div>
                    <h3 className="font-medium text-book-dark">שלחו את ההודעה</h3>
                    <p className="text-gray-600 mt-1 text-right">
                      לחצו על כפתור השליחה כדי להוסיף את הברכה לספר
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500">
                  צריכים עזרה? צרו קשר עם התמיכה שלנו
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InfoModal;
