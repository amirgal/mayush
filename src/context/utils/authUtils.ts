import { useContext, createContext } from 'react';

type AuthContextType = {
  username: string | null;
  name: string | null;
  userId: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  setAuth: (userId: string, username: string, name: string, isAdmin: boolean) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
