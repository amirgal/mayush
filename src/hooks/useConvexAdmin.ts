import { useAction, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { useAuthContext } from '../context/utils/authUtils';

// Define types for admin-related results
export type User = {
  _id: Id<'users'>;
  username: string;
  name: string;
  isAdmin: boolean;
  createdAt: number;
};

export type CreateUserResult = {
  success: boolean;
  userId?: string;
  message?: string;
};

// Custom hook for admin-related Convex functions
export const useConvexAdmin = () => {
  // Get the admin status from auth context
  const { isAdmin } = useAuthContext();
  
  // Use the type-safe query and mutation references
  const getAllUsersQuery = useQuery(api.auth.getAllUsers, { isAdmin });
  const registerUserMutation = useAction(api.auth.registerUserAction);

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

  const createUser = async (username: string, name: string, password: string, isAdmin: boolean): Promise<CreateUserResult> => {
    try {
      const result = await registerUserMutation({ 
        username, 
        name,
        password, 
        isAdmin, 
        adminRequest: true // This is an admin creating the user
      });
      return result as CreateUserResult;
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, message: 'An error occurred while creating the user' };
    }
  };

  return {
    getAllUsers,
    createUser
  };
};
