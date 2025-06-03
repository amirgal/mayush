import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/utils/authUtils';
import Header from '../components/layout/Header';
import { useConvexAdmin } from '../hooks/useConvexAdmin';
import type { User as UserData } from '../hooks/useConvexAdmin';
import { TrashIcon } from '@heroicons/react/24/outline';

const AdminPage = () => {
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const { userId, isAdmin, isAuthenticated } = useAuthContext();
  
  const pageTitle = 'דף ניהול';
  const navigate = useNavigate();
  
  const { getAllUsers, deleteUser } = useConvexAdmin();
  
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/');
    }
  }
  , [isAuthenticated, navigate, isAdmin]);
  
  const users = getAllUsers();
  
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete._id);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setUserToDelete(null);
    }
  };
  
  const handleBackToGuestbook = () => {
    navigate('/guestbook');
  };

  return (
    <div className="min-h-screen bg-book-light">
      <Header 
        isAdmin={isAdmin} 
        onAdminClick={() => {}} 
        viewMode="book"
        onToggleView={() => {}}
        isAdminPage
      />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-book-dark font-book-title">{pageTitle}</h1>
          <button 
            onClick={handleBackToGuestbook}
            className="btn-primary"
            tabIndex={0}
          >
            חזרה לספר הברכות
          </button>
        </div>
        
        <div className="admin-panel">
          <h2 className="text-2xl font-bold mb-6 text-book-dark font-book-title border-b border-book-dark/10 pb-4">ניהול משתמשים</h2>
          <div className="grid grid-cols-1 gap-8">
            {/* Users List */}
            <div className="bg-gradient-to-br from-white to-book-page rounded-lg shadow-lg border border-book-dark/5">
              <div className="p-6">
                <h3 className="font-bold text-xl text-book-dark font-book-title mb-6 border-b border-book-dark/10 pb-3">
                  משתמשים קיימים
                </h3>
                <div className="overflow-hidden rounded-lg border border-book-dark/10">
                  <div className="overflow-y-auto max-h-[400px]">
                    <table className="w-full border-collapse bg-white">
                      <thead className="bg-gradient-to-r from-book-light/50 to-book-page sticky top-0 shadow-sm">
                        <tr>
                          <th className="text-right p-4 text-book-dark/70 font-medium text-sm">מזהה</th>
                          <th className="text-right p-4 text-book-dark/70 font-medium text-sm">תפקיד</th>
                          <th className="text-center p-4 text-book-dark/70 font-medium text-sm">פעולות</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user: UserData) => (
                          <tr 
                            key={user._id} 
                            className="border-t border-book-dark/5 transition-colors hover:bg-book-light/20"
                          >
                            <td className="p-4 text-book-dark">{user._id}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${user.isAdmin ? 
                                  'bg-book-accent/10 text-book-accent' : 
                                  'bg-book-dark/10 text-book-dark'
                                }`}>
                                {user.isAdmin ? 'מנהל' : 'משתמש'}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => setUserToDelete(user)}
                                className={`text-red-600 hover:text-red-800 p-1.5 rounded-full 
                                          hover:bg-red-50 transition-colors
                                          ${user.isAdmin && users.filter(u => u.isAdmin).length <= 1 || user._id === userId ? 
                                            'opacity-50 cursor-not-allowed' : 
                                            'hover:scale-110 transform transition-transform'
                                          }`}
                                aria-label={`מחק את ${user._id}`}
                                disabled={user.isAdmin && users.filter(u => u.isAdmin).length <= 1 || user._id === userId}
                                title={user._id === userId ?
                                  'לא ניתן למחוק את עצמך' :
                                  user.isAdmin && users.filter(u => u.isAdmin).length <= 1 ?
                                  'לא ניתן למחוק את המנהל האחרון' :
                                  `מחק את ${user._id}`}
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {users.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-book-dark/50">
                              לא נמצאו משתמשים
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-book-dark/10">
            <h4 className="text-xl font-bold mb-4 text-book-dark text-right font-book-title">
              אישור מחיקת משתמש
            </h4>
            <p className="text-book-dark/70 mb-6 text-right" dir="rtl">
              האם את/ה בטוח/ה שברצונך למחוק את המשתמש {userToDelete._id}?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-book-dark/60 hover:text-book-dark transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-md 
                         hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-md 
                         hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
              >
                מחק
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
