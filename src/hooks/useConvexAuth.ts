import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Define types for our authentication results
export type VerifyCredentialsResult = {
  success: boolean;
  isAdmin: boolean;
  message?: string;
};

export type RegisterUserResult = {
  success: boolean;
  message?: string;
};

// Custom hook for authentication-related Convex functions
export const useConvexAuth = () => {
  // Use the type-safe mutation references
  const verifyCredentials = useMutation(api.auth.verifyCredentials);
  const registerUser = useMutation(api.auth.registerUser);

  // Wrapper functions with proper typing
  const login = async (username: string, password: string): Promise<VerifyCredentialsResult> => {
    try {
      const result = await verifyCredentials({ username, password });
      return result as VerifyCredentialsResult;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, isAdmin: false, message: 'An error occurred during login' };
    }
  };

  const register = async (username: string, password: string, isAdmin: boolean = false, adminRequest: boolean = false): Promise<RegisterUserResult> => {
    try {
      const result = await registerUser({ username, password, isAdmin, adminRequest });
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
