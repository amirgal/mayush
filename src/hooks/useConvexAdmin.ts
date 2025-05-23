import {  useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { useAuthContext } from '../context/utils/authUtils';

// Define types for admin-related results
export type User = {
  _id: Id<'users'>;
  isAdmin: boolean;
  createdAt: number;
};


export type DeleteUserResult = {
  success: boolean;
  message?: string;
};

// Custom hook for admin-related Convex functions
export const useConvexAdmin = () => {
  // Get the admin status from auth context
  const { isAdmin } = useAuthContext();
  
  // Use the type-safe query and mutation references
  const getAllUsersQuery = useQuery(api.auth.getAllUsers, { isAdmin });
  const deleteUserMutation = useMutation(api.auth.deleteUser);

  // Wrapper functions with proper typing
  const getAllUsers = (): User[] => {
    try {
      // If the query is still loading or undefined, return an empty array
      if (!getAllUsersQuery) return [];
      
      return getAllUsersQuery as User[] || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };


  const deleteUser = async (userId: Id<"users">): Promise<DeleteUserResult> => {
    try {
      await deleteUserMutation({ userId, isAdmin });
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      const message = error instanceof Error ? error.message : 'An error occurred while deleting the user';
      return { success: false, message };
    }
  };

  return {
    getAllUsers,
    deleteUser
  };
};
