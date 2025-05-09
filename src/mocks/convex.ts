// This file provides mock implementations of Convex hooks for development
// In a real application, these would be provided by the Convex client
import { mockMessages, mockReactions, mockUsers, verifyCredentials, registerUser, getReactionsForMessage, getAllUsers } from './data';
import type { Message, Reaction } from '../types';

// Define generic types for query and mutation arguments
type QueryArgs = Record<string, unknown>;
type MutationArgs = Record<string, unknown>;
type MutationResult = Record<string, unknown>;

// Mock query hook
export function useQuery<T>(queryName: string, args?: QueryArgs): T | undefined {
  console.log(`Mock useQuery called for ${queryName} with args:`, args);
  
  // Handle different query types
  let sortedMessages;
  
  switch (queryName) {
    case 'messages.getAllWithPinnedFirst':
    case 'messages.getAll':
      // Sort messages by pinned status and creation time
      sortedMessages = [...mockMessages].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.createdAt - a.createdAt;
      });
      return sortedMessages as unknown as T;
      
    case 'reactions.getForMessage':
      if (args && 'messageId' in args) {
        const messageId = args.messageId as string;
        return getReactionsForMessage(messageId) as unknown as T;
      }
      return [] as unknown as T;
      
    case 'auth.getAllUsers':
      if (args && 'isAdmin' in args) {
        const isAdmin = args.isAdmin as boolean;
        // Use mockUsers directly if needed for debugging
        console.log(`Current users: ${mockUsers.length}`);
        return getAllUsers(isAdmin) as unknown as T;
      }
      return [] as unknown as T;
      
    default:
      return undefined;
  }
}

// Mock mutation hook
export function useMutation<T extends MutationResult = MutationResult>(
  mutationName: string
): (args?: MutationArgs) => Promise<T> {
  return async (args?: MutationArgs) => {
    console.log(`Mock useMutation called for ${mutationName} with args:`, args);
    
    // Handle different mutation types
    switch (mutationName) {
      case 'messages.add':
        if (args) {
          const newMessage: Message = {
            _id: Math.random().toString(36).substring(2, 15),
            _creationTime: Date.now(),
            author: args.author as string || 'Anonymous',
            content: args.content as string || '',
            imageUrl: args.imageUrl as string | undefined,
            createdAt: Date.now(),
            isPinned: false,
          };
          mockMessages.push(newMessage);
          return { messageId: newMessage._id } as unknown as T;
        }
        break;
        
      case 'messages.togglePin':
        if (args && 'messageId' in args) {
          const messageId = args.messageId as string;
          const message = mockMessages.find(m => m._id === messageId);
          if (message) {
            message.isPinned = !message.isPinned;
            return { isPinned: message.isPinned } as unknown as T;
          }
        }
        break;
        
      case 'reactions.addReaction':
        if (args && 'messageId' in args && 'emoji' in args) {
          const messageId = args.messageId as string;
          const emoji = args.emoji as string;
          
          // Check if reaction already exists
          const existingReaction = mockReactions.find(
            r => r.messageId === messageId && r.emoji === emoji
          );
          
          if (existingReaction) {
            existingReaction.count += 1;
            return { reactionId: existingReaction._id } as unknown as T;
          } else {
            const newReaction: Reaction = {
              _id: Math.random().toString(36).substring(2, 15),
              _creationTime: Date.now(),
              messageId,
              emoji,
              count: 1,
            };
            mockReactions.push(newReaction);
            return { reactionId: newReaction._id } as unknown as T;
          }
        }
        break;
        
      case 'reactions.removeReaction':
        if (args && 'reactionId' in args) {
          const reactionId = args.reactionId as string;
          const reactionIndex = mockReactions.findIndex(r => r._id === reactionId);
          
          if (reactionIndex !== -1) {
            const reaction = mockReactions[reactionIndex];
            if (reaction.count > 1) {
              reaction.count -= 1;
            } else {
              mockReactions.splice(reactionIndex, 1);
            }
            return { success: true } as unknown as T;
          }
        }
        break;
        
      case 'auth.verifyCredentials':
        if (args && 'username' in args && 'password' in args) {
          const username = args.username as string;
          const password = args.password as string;
          return verifyCredentials(username, password) as unknown as T;
        }
        return { success: false, isAdmin: false, message: 'Invalid credentials' } as unknown as T;
        
      case 'auth.registerUser':
        if (args && 'username' in args && 'password' in args) {
          const username = args.username as string;
          const password = args.password as string;
          const isAdmin = args.isAdmin as boolean || false;
          return registerUser(username, password, isAdmin) as unknown as T;
        }
        return { success: false, message: 'Invalid registration data' } as unknown as T;
        
      // Access code related functionality removed
    }
    
    return {} as T;
  };
}
