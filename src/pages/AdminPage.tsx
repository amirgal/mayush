import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/utils/authUtils';
import Header from '../components/layout/Header';
import { useConvexAdmin } from '../hooks/useConvexAdmin';
import type { User as UserData } from '../hooks/useConvexAdmin';
import { TrashIcon } from '@heroicons/react/24/outline';

const AdminPage = () => {
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const { username, userId, isAdmin, isAuthenticated, logout } = useAuthContext();
  
  const pageTitle = username ? `דף ניהול (${username})` : 'דף ניהול';
  const navigate = useNavigate();
  
  const { getAllUsers, createUser, deleteUser } = useConvexAdmin();
  
  if (!isAuthenticated || !isAdmin) {
    navigate('/');
    return null;
  }
  
  const users = getAllUsers();
  
  const handleRegisterUser = async () => {
    if (!newUsername.trim()) {
      alert('נא להזין שם משתמש');
      return;
    }
    
    if (!newName.trim()) {
      alert('נא להזין שם תצוגה');
      return;
    }
    
    if (!newPassword.trim()) {
      alert('נא להזין סיסמה');
      return;
    }
    
    try {
      const result = await createUser(newUsername, newName, newPassword, isAdminUser);
      
      if (result.success) {
        alert(`המשתמש ${newUsername} נוצר בהצלחה!`);
        setNewUsername('');
        setNewName('');
        setNewPassword('');
        setIsAdminUser(false);
      } else {
        alert(result.message || 'יצירת המשתמש נכשלה');
      }
    } catch (err) {
      console.error(err);
      alert('אירעה שגיאה ביצירת המשתמש.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const result = await deleteUser(userToDelete._id);
      if (result.success) {
        alert(`המשתמש ${userToDelete.username} נמחק בהצלחה`);
      } else {
        alert(result.message || 'מחיקת המשתמש נכשלה');
      }
    } catch (error) {
      console.error(error);
      alert('אירעה שגיאה במחיקת המשתמש');
    } finally {
      setUserToDelete(null);
    }
  };
  
  const handleBackToGuestbook = () => {
    navigate('/guestbook');
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-book-light">
      <Header 
        isAdmin={isAdmin} 
        onAdminClick={() => {}} 
        onLogout={handleLogout} 
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create New User */}
            <div className="bg-gradient-to-br from-white to-book-page rounded-lg shadow-lg border border-book-dark/5">
              <div className="p-6">
                <h3 className="font-bold text-xl text-book-dark font-book-title mb-6 border-b border-book-dark/10 pb-3">
                  משתמש חדש
                </h3>
                <div className="space-y-5">
                  <div className="relative">
                    <label htmlFor="username" className="block mb-2 text-book-dark/80 text-right text-sm">
                      שם משתמש
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="הזן שם משתמש"
                      className="input-field w-full text-right bg-white/80 focus:bg-white transition-colors"
                      aria-label="שדה שם משתמש"
                      tabIndex={0}
                      dir="rtl"
                    />
                  </div>
                  
                  <div className="relative">
                    <label htmlFor="name" className="block mb-2 text-book-dark/80 text-right text-sm">
                      שם תצוגה
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="הזן שם תצוגה"
                      className="input-field w-full text-right bg-white/80 focus:bg-white transition-colors"
                      aria-label="שדה שם תצוגה"
                      tabIndex={0}
                      dir="rtl"
                    />
                  </div>
                  
                  <div className="relative">
                    <label htmlFor="password" className="block mb-2 text-book-dark/80 text-right text-sm">
                      סיסמה
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="הזן סיסמה"
                      className="input-field w-full text-right bg-white/80 focus:bg-white transition-colors"
                      aria-label="שדה סיסמה"
                      tabIndex={0}
                      dir="rtl"
                    />
                  </div>
                  
                  <div className="relative">
                    <div className="flex items-center justify-end py-2">
                      <label 
                        htmlFor="isAdmin" 
                        className="text-book-dark/80 ml-3 select-none text-sm cursor-pointer hover:text-book-dark transition-colors"
                      >
                        הגדר כמנהל מערכת
                      </label>
                      <div className="relative">
                        <input
                          id="isAdmin"
                          type="checkbox"
                          checked={isAdminUser}
                          onChange={(e) => setIsAdminUser(e.target.checked)}
                          className="w-5 h-5 text-book-accent border-book-dark/30 rounded 
                                   focus:ring-2 focus:ring-book-accent/50 focus:ring-offset-0
                                   hover:border-book-accent/50 transition-colors cursor-pointer
                                   checked:bg-book-accent checked:hover:bg-book-accent/90
                                   checked:focus:bg-book-accent accent-book-accent"
                          tabIndex={0}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleRegisterUser}
                    className="w-full py-3 bg-gradient-to-br from-book-dark to-book-accent text-white rounded-md 
                             hover:from-book-accent hover:to-book-dark transition-all duration-300 
                             shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                    tabIndex={0}
                  >
                    צור משתמש
                  </button>
                </div>
              </div>
            </div>
            
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
                          <th className="text-right p-4 text-book-dark/70 font-medium text-sm">שם משתמש</th>
                          <th className="text-right p-4 text-book-dark/70 font-medium text-sm">שם תצוגה</th>
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
                            <td className="p-4 text-book-dark">{user.username}</td>
                            <td className="p-4 text-book-dark">{user.displayName}</td>
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
                                aria-label={`מחק את ${user.username}`}
                                disabled={user.isAdmin && users.filter(u => u.isAdmin).length <= 1 || user._id === userId}
                                title={user._id === userId ?
                                  'לא ניתן למחוק את עצמך' :
                                  user.isAdmin && users.filter(u => u.isAdmin).length <= 1 ?
                                  'לא ניתן למחוק את המנהל האחרון' :
                                  `מחק את ${user.username}`}
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
              האם את/ה בטוח/ה שברצונך למחוק את המשתמש {userToDelete.username}?
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
