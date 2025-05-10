import { useContext, createContext } from 'react';
import type { Id } from "../../../convex/_generated/dataModel";
type AuthContextType = {
  username: string | null;
  displayName: string | null;
  userId: Id<"users"> | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  setAuth: (userId: Id<"users">, username: string, displayName: string, isAdmin: boolean) => void;
  logout: () => void;
  user: { _id: Id<"users"> } | null;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
