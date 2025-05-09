// This file provides mock data for development
import type { Message, Reaction, User } from '../types';

// Generate a unique ID
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Mock messages data
export const mockMessages: Message[] = [
  {
    _id: generateId(),
    _creationTime: Date.now() - 86400000 * 2, // 2 days ago
    author: 'Sarah',
    content: 'Happy birthday! Hope your day is filled with books, board games, and lots of fun! 🎂',
    createdAt: Date.now() - 86400000 * 2,
    isPinned: true,
  },
  {
    _id: generateId(),
    _creationTime: Date.now() - 86400000, // 1 day ago
    author: 'Mike',
    content: 'Wishing you a wonderful birthday! Remember that time we played Catan until 3am? Let\'s do that again soon!',
    imageUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Ym9hcmQlMjBnYW1lfGVufDB8fDB8fHww&w=1000&q=80',
    createdAt: Date.now() - 86400000,
    isPinned: false,
  },
  {
    _id: generateId(),
    _creationTime: Date.now() - 43200000, // 12 hours ago
    author: 'Emma',
    content: 'Happy birthday! 📚 I got you that book we talked about last month. Can\'t wait to hear what you think!',
    createdAt: Date.now() - 43200000,
    isPinned: false,
  },
];

// Mock reactions data
export const mockReactions: Reaction[] = [
  {
    _id: generateId(),
    _creationTime: Date.now() - 86000000,
    messageId: mockMessages[0]._id,
    emoji: '❤️',
    count: 3,
  },
  {
    _id: generateId(),
    _creationTime: Date.now() - 85000000,
    messageId: mockMessages[0]._id,
    emoji: '🎂',
    count: 2,
  },
  {
    _id: generateId(),
    _creationTime: Date.now() - 84000000,
    messageId: mockMessages[1]._id,
    emoji: '👍',
    count: 1,
  },
];

// Mock users with username/password
export const mockUsers: User[] = [
  {
    _id: generateId(),
    _creationTime: Date.now() - 604800000, // 1 week ago
    username: 'admin',
    // In a real app, this would be a properly hashed password
    passwordHash: 'admin123', // Simple for development purposes
    isAdmin: true,
    createdAt: Date.now() - 604800000,
  },
  {
    _id: generateId(),
    _creationTime: Date.now() - 432000000, // 5 days ago
    username: 'guest',
    passwordHash: 'guest123',
    isAdmin: false,
    createdAt: Date.now() - 432000000,
  },
];

// Helper function to get reactions for a message
export const getReactionsForMessage = (messageId: string): Reaction[] => {
  return mockReactions.filter(reaction => reaction.messageId === messageId);
};

// Helper function to verify username and password
export const verifyCredentials = (username: string, password: string): { success: boolean; isAdmin: boolean; message?: string } => {
  const user = mockUsers.find(user => user.username === username);
  
  if (!user) {
    return { success: false, isAdmin: false, message: 'User not found' };
  }
  
  // In a real app, this would use proper password hashing
  if (user.passwordHash !== password) {
    return { success: false, isAdmin: false, message: 'Invalid password' };
  }
  
  return {
    success: true,
    isAdmin: user.isAdmin,
  };
};

// Helper function to register a new user
export const registerUser = (username: string, password: string, isAdmin: boolean = false): { success: boolean; message?: string } => {
  // Check if username already exists
  if (mockUsers.some(user => user.username === username)) {
    return { success: false, message: 'Username already exists' };
  }
  
  // Create new user
  const newUser: User = {
    _id: generateId(),
    _creationTime: Date.now(),
    username,
    passwordHash: password, // In a real app, this would be hashed
    isAdmin: isAdmin, // Set admin status based on parameter
    createdAt: Date.now(),
  };
  
  mockUsers.push(newUser);
  return { success: true };
};

// Helper function to get all users
export const getAllUsers = (isAdmin: boolean): User[] => {
  // Only return users if the requester is an admin
  if (!isAdmin) {
    return [];
  }
  
  return mockUsers;
};
