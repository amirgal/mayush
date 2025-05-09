import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './utils/authUtils';
import type { Id } from "../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('username') || null);
  const [name, setName] = useState<string | null>(() => localStorage.getItem('name') || null);
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
      setName(userQuery.name); // Optional: keep name in sync with backend
    }
  }, [userQuery]);

  const setAuth = (userId: Id<"users">, username: string, displayName: string, admin: boolean) => {
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