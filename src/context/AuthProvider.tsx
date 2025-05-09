import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './utils/authUtils';
import type { Id } from "../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
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

  useEffect(() => {
    if (userQuery) {
      setIsAdmin(userQuery.isAdmin);
      setDisplayName(userQuery.displayName); // Optional: keep displayName in sync with backend
    }
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

  const logout = () => {
    setUserId(null);
    setUsername(null);
    setDisplayName(null);
    setIsAdmin(false);
    setIsAuthenticated(false);
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('displayName');
    localStorage.removeItem('isAuthenticated');
  };

  return (
    <AuthContext.Provider value={{ username, displayName, userId, isAdmin, isAuthenticated, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};