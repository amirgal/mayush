import { type FC, useState } from "react";
import { useForm } from "../../context/FormContext";
import InfoModal from "../common/InfoModal";

type HeaderProps = {
  isAdmin: boolean;
  viewMode: "book" | "kindle";
  isAdminPage?: boolean;
  onAdminClick: () => void;
  onToggleView: () => void;
};

const Header: FC<HeaderProps> = ({
  isAdmin,
  viewMode,
  isAdminPage = false,
  onAdminClick,
  onToggleView,
}) => {
  const { openForm } = useForm();

  const handleKeyDown = (callback: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      callback();
    }
  };

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const toggleInfoModal = () => {
    setIsInfoModalOpen(!isInfoModalOpen);
  };

  return (
    <>
      <header className="bg-book-dark text-white py-2 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            {!isAdminPage && (
              <>
                <button
                  onClick={() => openForm()}
                  onKeyDown={handleKeyDown(() => openForm())}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
                  aria-label="Add new message"
                  title="Add new message"
                >
                  <span className="text-lg">+</span>
                  <span>ברכה חדשה!</span>
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            {!isAdminPage && (
              <>
                <button
                  onClick={toggleInfoModal}
                  onKeyDown={handleKeyDown(toggleInfoModal)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
                  aria-label="Show instructions"
                  title="Show instructions"
                >
                  <span className="text-lg">?</span>
                  <span className="hidden sm:inline">Help</span>
                </button>
                <button
                  onClick={onToggleView}
                  onKeyDown={handleKeyDown(onToggleView)}
                  className="text-white hover:text-book-accent transition-colors flex items-center"
                  aria-label={`עבור לתצוגת ${viewMode === "book" ? "קינדל" : "ספר"}`}
                  title={viewMode === "book" ? "קינדל" : "ספר"}
                  tabIndex={0}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 md:ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {viewMode === "book" ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7.5 3h9A1.5 1.5 0 0118 4.5v15a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 016 19.5v-15A1.5 1.5 0 017.5 3zm0 0v15a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5v-15M12 17v1m-4-3h8"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    )}
                  </svg>
                  <span className="hidden md:inline">
                    {viewMode === "book" ? "קינדל" : "ספר"}
                  </span>
                </button>
              </>
            )}

            {isAdmin && !isAdminPage && (
              <button
                onClick={onAdminClick}
                onKeyDown={handleKeyDown(onAdminClick)}
                className="text-white hover:text-book-accent transition-colors flex items-center"
                aria-label="ניהול"
                title="ניהול"
                tabIndex={0}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 md:ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="hidden md:inline">ניהול</span>
              </button>
            )}
          </div>
        </div>
      </header>
      <InfoModal isOpen={isInfoModalOpen} onClose={toggleInfoModal} />
    </>
  );
};

export default Header;
