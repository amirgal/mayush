import { type FC } from "react";
import { useAuthContext } from "../../context/utils/authUtils";

type HeaderProps = {
  isAdmin: boolean;
  viewMode: "book" | "kindle";
  isAdminPage?: boolean;
  onAdminClick: () => void;
  onLogout: () => void;
  onToggleView: () => void;
};

const Header: FC<HeaderProps> = ({
  isAdmin,
  viewMode,
  isAdminPage = false,
  onAdminClick,
  onLogout,
  onToggleView,
}) => {
  const { username } = useAuthContext();
  const welcomeMessage = username ? `ברוך הבא, ${username}!` : "ברוך הבא!";

  const handleKeyDown = (callback: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      callback();
    }
  };

  return (
    <header className="bg-book-dark text-white py-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          {!isAdminPage && (
            <button
              onClick={onToggleView}
              onKeyDown={handleKeyDown(onToggleView)}
              className="text-white hover:text-book-accent transition-colors flex items-center"
              aria-label={`עבור לתצוגת ${viewMode === "book" ? "כרטיסים" : "ספר"}`}
              title={viewMode === "book" ? "תצוגת קינדל" : "תצוגת ספר"}
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                )}
              </svg>
              <span className="hidden md:inline">
                {viewMode === "book" ? "תצוגת קינדל" : "תצוגת ספר"}
              </span>
            </button>
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

          <button
            onClick={onLogout}
            onKeyDown={handleKeyDown(onLogout)}
            className="text-white hover:text-book-accent transition-colors flex items-center"
            aria-label="התנתק"
            title="התנתק"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="hidden md:inline">התנתק</span>
          </button>
        </div>
        <div className="text-lg text-white/80">{welcomeMessage}</div>
      </div>
    </header>
  );
};

export default Header;
