import { useEffect, useState } from 'react';
import { useConvexAuth } from '../hooks/useConvexAuth';
import type { ReactNode } from 'react';
import { AuthContext } from './utils/authUtils';
import type { Id } from "../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { register } = useConvexAuth();
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('username') || null);
  const [displayName, setDisplayName] = useState<string | null>(() => localStorage.getItem('displayName') || null);
  const [userId, setUserId] = useState<Id<"users"> | null>(() => {
    const savedId = localStorage.getItem('userId');
    return savedId ? (savedId as Id<"users">) : null;
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('isAuthenticated') === 'true');

  // Securely fetch user by userId from Convex
  const userQuery = useQuery(
    api.auth.getUserById,
    userId ? { userId } : "skip"
  );

  // Automatic onboarding
  useEffect(() => {
    const onboard = async () => {
      const localUserId = localStorage.getItem('userId');
      if (!localUserId) {
        const randomString = () =>
          Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        const username = `user_${randomString()}`;
        const displayName = `Guest_${randomString().slice(0, 6)}`;
        const password = randomString() + randomString();
        const result = await register(username, displayName, password, false, false);
        // Type guard for register result
        if (result && typeof result === 'object' && 'success' in result && result.success && 'userId' in result && result.userId) {
          setAuth(result.userId as Id<'users'>, username, displayName, false);
        }
      } else if (userQuery) {
        setAuth(userQuery._id, userQuery.username, userQuery.displayName, userQuery.isAdmin);
      }
    };
    onboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userQuery]);

  const setAuth = (userId: Id<"users">, username: string, displayName: string, admin: boolean) => {
    console.log('Setting auth state:', { userId, username, displayName, admin });
    setUserId(userId);
    setUsername(username);
    setDisplayName(displayName);
    setIsAdmin(admin);
    setIsAuthenticated(true);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
    localStorage.setItem('displayName', displayName);
    localStorage.setItem('isAuthenticated', 'true');
  };

  return (
    <AuthContext.Provider value={{ 
      username, 
      displayName, 
      userId, 
      isAdmin, 
      isAuthenticated, 
      setAuth, 
      user: userQuery ? { _id: userQuery._id } : null 
    }}>
      {children}
    </AuthContext.Provider>
  );
};