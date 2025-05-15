import { useEffect, useState, useRef } from 'react';
import { useConvexAuth } from '../hooks/useConvexAuth';
import type { ReactNode } from 'react';
import { AuthContext } from './utils/authUtils';
import type { Id } from "../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { register } = useConvexAuth();
  const [userId, setUserId] = useState<Id<"users"> | null>(() => {
    const savedId = localStorage.getItem('userId');
    return savedId ? (savedId as Id<"users">) : null;
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem('isAuthenticated') === 'true');
  const [user, setUser] = useState<{ _id: Id<'users'> } | null>(null);
  const userQuery = useQuery(
    api.auth.getUserById,
    userId ? { userId } : "skip"
  );

  // Automatic onboarding
  const registeringRef = useRef(false);
  useEffect(() => {
    const onboard = async () => {
      if (!userId && !registeringRef.current) {
        registeringRef.current = true;
        // New user: register, set auth, DO NOT run userQuery
        const result = await register(false, false);
        if (result && typeof result === 'object' && 'success' in result && result.success && 'userId' in result && result.userId) {
          setAuth(result.userId as Id<'users'>, false);
        }
        registeringRef.current = false;
      } else if (userId && userQuery) {
        // Returning user: use query result
        setAuth(userQuery._id as Id<'users'>, userQuery.isAdmin);
      }
    };
    onboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userQuery]);

  const setAuth = (userId: Id<"users">, admin: boolean) => {
    setUserId(userId);
    setIsAdmin(admin);
    setIsAuthenticated(true);
    setUser(userQuery ? { _id: userQuery._id } : { _id: userId });
    localStorage.setItem('userId', userId);
    localStorage.setItem('isAuthenticated', 'true');
  };

  return (
    <AuthContext.Provider value={{ 
      userId, 
      isAdmin, 
      isAuthenticated, 
      setAuth,
      user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};