import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Define the result type for the login action, matching the backend
export type VerifyLoginResult = 
  | { success: true; isAdmin: boolean } 
  | { success: false; message: string; isAdmin: false };

export type RegisterUserResult = {
  success: boolean;
  message?: string;
};

// Custom hook for authentication-related Convex functions
export const useConvexAuth = () => {
  // Use the type-safe action references
  const loginUser = useAction(api.auth.verifyLoginAction);
  const registerUserAction = useAction(api.auth.registerUserAction);

  // Wrapper functions with proper typing
  const login = async (username: string, password: string): Promise<VerifyLoginResult> => {
    try {
      const result = await loginUser({ username, password });
      return result as VerifyLoginResult;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, isAdmin: false, message: 'An error occurred during login' };
    }
  };

  const register = async (username: string, name: string, password: string, isAdmin: boolean = false, adminRequest: boolean = false): Promise<RegisterUserResult> => {
    try {
      const result = await registerUserAction({ username, name, password, isAdmin, adminRequest });
      return result as RegisterUserResult;
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'An error occurred during registration' };
    }
  };

  return {
    login,
    register
  };
};
