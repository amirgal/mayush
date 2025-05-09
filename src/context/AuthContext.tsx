import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

type AuthContextType = {
  username: string | null;
  name: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  setAuth: (username: string, name: string, isAdmin: boolean) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState<string | null>(() => {
    const savedUsername = localStorage.getItem('username');
    return savedUsername || null;
  });
  
  const [name, setName] = useState<string | null>(() => {
    const savedName = localStorage.getItem('name');
    return savedName || null;
  });
  
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('isAdmin') === 'true';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const setAuth = (username: string, displayName: string, admin: boolean) => {
    setUsername(username);
    setName(displayName);
    setIsAdmin(admin);
    setIsAuthenticated(true);
    localStorage.setItem('username', username);
    localStorage.setItem('name', displayName);
    localStorage.setItem('isAdmin', admin.toString());
    localStorage.setItem('isAuthenticated', 'true');
  };

  const logout = () => {
    setUsername(null);
    setName(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
    localStorage.removeItem('username');
    localStorage.removeItem('name');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('isAuthenticated');
  };

  return (
    <AuthContext.Provider value={{ username, name, isAdmin, isAuthenticated, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
