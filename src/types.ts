// We're creating our own type definitions since the Convex generated files might not be accessible directly
// These types match the schema we defined in convex/schema.ts

// Generic document type
export type Doc<T> = T & {
  _id: string;
  _creationTime: number;
};

// Message type
export type Message = Doc<{
  author: string;
  content: string;
  imageUrl?: string;
  createdAt: number;
  isPinned: boolean;
}>;

// Reaction type
export type Reaction = Doc<{
  messageId: string;
  emoji: string;
  count: number;
}>;

// User type
export type User = Doc<{
  username: string;
  passwordHash: string;
  isAdmin: boolean;
  createdAt: number;
}>;

// Auth response type
export type AuthResponse = {
  success: boolean;
  isAdmin: boolean;
  message?: string;
};

// Old type definitions removed to avoid duplicates

// Define view mode type
export type ViewMode = 'card' | 'book';
