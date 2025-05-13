import type { Id } from '../convex/_generated/dataModel';

// Generic document type with Convex ID
// Use a more specific type for TableName to satisfy the constraint
export type Doc<T, TableName extends 'messages' | 'reactions' | 'users'> = T & {
  _id: Id<TableName>;
  _creationTime: number;
};

// Image type for message attachments
export type ImageAttachment = {
  storageId: Id<'_storage'>;
  url: string;
  previewUrl?: string; // Optional temporary URL for local preview
};

// Message type
export type Message = Doc<{
  author: string;
  content: string;
  imageUrls?: ImageAttachment[];
  createdAt: number;
  isPinned: boolean;
  userId: Id<'users'>;
}, 'messages'>;

// Reaction type
export type Reaction = Doc<{
  messageId: Id<'messages'>;
  emoji: string;
  userId: Id<'users'>;
}, 'reactions'>;

// Reaction with count for display
export type ReactionWithCount = {
  emoji: string;
  count: number;
  userReacted: boolean;
  reactions: Reaction[];
};

// User type
export type User = Doc<{
  username: string;
  displayName: string;
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
export type ViewMode = 'book' | 'kindle';
