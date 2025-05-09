import { useContext, createContext } from 'react';

type AuthContextType = {
  username: string | null;
  name: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  setAuth: (username: string, name: string, isAdmin: boolean) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
