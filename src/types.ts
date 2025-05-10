import type { Id } from '../convex/_generated/dataModel';

// Generic document type with Convex ID
// Use a more specific type for TableName to satisfy the constraint
export type Doc<T, TableName extends 'messages' | 'reactions' | 'users'> = T & {
  _id: Id<TableName>;
  _creationTime: number;
};

// Message type
export type Message = Doc<{
  author: string;
  content: string;
  imageUrl?: string;
  createdAt: number;
  isPinned: boolean;
  userId: Id<'users'>;
}, 'messages'>;

// Reaction type
export type Reaction = Doc<{
  messageId: Id<'messages'>;
  emoji: string;
  count: number;
  userId?: Id<'users'>;
}, 'reactions'>;

// User type
export type User = Doc<{
  username: string;
  passwordHash: string;
  isAdmin: boolean;
  createdAt: number;
}, 'users'>;

// Auth response type
export type AuthResponse = {
  success: boolean;
  isAdmin: boolean;
  message?: string;
};

// Old type definitions removed to avoid duplicates

// Define view mode type
export type ViewMode = 'card' | 'book';
