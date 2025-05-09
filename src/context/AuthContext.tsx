import { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './utils/authUtils';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState<string | null>(() => {
    const savedUsername = localStorage.getItem('username');
    return savedUsername || null;
  });
  
  const [name, setName] = useState<string | null>(() => {
    const savedName = localStorage.getItem('name');
    return savedName || null;
  });

  const [userId, setUserId] = useState<string | null>(() => {
    const savedId = localStorage.getItem('userId');
    return savedId || null;
  });
  
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const setAuth = (userId: string, username: string, displayName: string, admin: boolean) => {
    setUserId(userId);
    setUsername(username);
    setName(displayName);
    setIsAdmin(admin);
    setIsAuthenticated(true);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
    localStorage.setItem('name', displayName);
    localStorage.setItem('isAuthenticated', 'true');
  };
  
  const logout = () => {
    setUserId(null);
    setUsername(null);
    setName(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('name');
    localStorage.removeItem('isAuthenticated');
  };

  return (
    <AuthContext.Provider value={{ username, name, userId, isAdmin, isAuthenticated, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
