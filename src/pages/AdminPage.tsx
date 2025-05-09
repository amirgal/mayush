import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/utils/authUtils';
import Header from '../components/layout/Header';
import { useConvexAdmin } from '../hooks/useConvexAdmin';
import type { User as UserData } from '../hooks/useConvexAdmin';

const AdminPage = () => {
  // User creation state
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isAdminUser, setIsAdminUser] = useState(false);
  const { username, isAdmin, isAuthenticated, logout } = useAuth();
  
  // Set page title with admin username
  const pageTitle = username ? `Admin Dashboard (${username})` : 'Admin Dashboard';
  const navigate = useNavigate();
  
  // Use our custom hook for admin functions
  const { getAllUsers, createUser } = useConvexAdmin();
  
  // Redirect to login if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    navigate('/');
    return null;
  }
  
  // Get users after the early return check
  const users = getAllUsers();
  
  const handleRegisterUser = async () => {
    if (!newUsername.trim()) {
      alert('Please enter a username');
      return;
    }
    
    if (!newName.trim()) {
      alert('Please enter a name');
      return;
    }
    
    if (!newPassword.trim()) {
      alert('Please enter a password');
      return;
    }
    
    try {
      // Use our custom createUser function
      const result = await createUser(newUsername, newName, newPassword, isAdminUser);
      
      if (result.success) {
        alert(`User ${newUsername} created successfully!`);
        setNewUsername('');
        setNewName('');
        setNewPassword('');
        setIsAdminUser(false);
      } else {
        alert(result.message || 'Failed to create user');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while creating the user.');
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
        viewMode="card"
        onToggleView={() => {}}
        isAdminPage
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-book-dark">{pageTitle}</h1>
          <button 
            onClick={handleBackToGuestbook}
            className="btn-primary"
            tabIndex={0}
          >
            Back to Guestbook
          </button>
        </div>
        
        {/* User Management Section */}
        <div className="book-page mb-8">
          <h2 className="text-xl font-bold mb-4 text-book-dark">User Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-2">Create New User</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="username" className="block mb-1 text-book-dark">Username</label>
                  <input
                    id="username"
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter username"
                    className="input-field w-full"
                    aria-label="Username input"
                    tabIndex={0}
                  />
                </div>
                <div>
                  <label htmlFor="name" className="block mb-1 text-book-dark">Display Name</label>
                  <input
                    id="name"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter display name"
                    className="input-field w-full"
                    aria-label="Display name input"
                    tabIndex={0}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block mb-1 text-book-dark">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter password"
                    className="input-field w-full"
                    aria-label="Password input"
                    tabIndex={0}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id="isAdmin"
                    type="checkbox"
                    checked={isAdminUser}
                    onChange={(e) => setIsAdminUser(e.target.checked)}
                    className="mr-2"
                    tabIndex={0}
                  />
                  <label htmlFor="isAdmin" className="text-book-dark">Admin User</label>
                </div>
                <button 
                  onClick={handleRegisterUser}
                  className="btn-primary w-full"
                  tabIndex={0}
                >
                  Create User
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-2">Existing Users</h3>
              <div className="overflow-y-auto max-h-60 border border-book-dark/20 rounded">
                <table className="w-full border-collapse">
                  <thead className="bg-book-light/50">
                    <tr className="border-b border-book-dark/20">
                      <th className="text-left p-2">Username</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user: UserData) => (
                      <tr key={user._id} className="border-b border-book-dark/10 hover:bg-book-light/50">
                        <td className="p-2">{user.username}</td>
                        <td className="p-2">{user.name}</td>
                        <td className="p-2">{user.isAdmin ? 'Admin' : 'User'}</td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={2} className="p-4 text-center text-gray-500">No users found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* No access code sections anymore */}
      </div>
    </div>
  );
};

export default AdminPage;
