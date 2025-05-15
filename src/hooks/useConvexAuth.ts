import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Define the result type for the login action, matching the backend
export type VerifyLoginResult = 
  | { success: true; userId: string; displayName: string; isAdmin: boolean } 
  | { success: false; message: string; isAdmin: false };

export type RegisterUserResult = {
  success: boolean;
  message?: string;
  userId?: string;
};

// Custom hook for authentication-related Convex functions
export const useConvexAuth = () => {
  // Use the type-safe action references
  const registerUserAction = useAction(api.auth.registerUserAction);

  const register = async (isAdmin: boolean = false, adminRequest: boolean = false): Promise<RegisterUserResult> => {
    try {
      const result = await registerUserAction({
        isAdmin,
        adminRequest,
      });
      return result as RegisterUserResult;
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'An error occurred during registration' };
    }
  };

  return {
    register
  };
};
