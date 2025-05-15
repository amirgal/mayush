import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel"; // Changed to type-only import
import { api } from "./_generated/api";

// Define the return type for insertUser, which will be the return type for registerUserAction's handler
type InsertUserResult = 
  | { success: true; userId: Id<"users"> } 
  | { success: false; message: string };

// Query: Get user by id
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  }
});


// Action: Register a new user (handles password hashing)
export const registerUserAction = action({
  args: {
    isAdmin: v.boolean(),
    adminRequest: v.boolean(),
  },
  handler: async (ctx, args): Promise<InsertUserResult> => { // <<< ANNOTATION ADDED HERE
    return await ctx.runMutation(api.auth.insertUser, {
      isAdmin: args.isAdmin,
      adminRequest: args.adminRequest,
    }) as InsertUserResult;
  },
});

// Mutation: Insert user (no hashing)
export const insertUser = mutation({
  args: {
    isAdmin: v.boolean(),
    adminRequest: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Only admins can create admin users
    if (args.isAdmin && !args.adminRequest) {
      throw new Error("Unauthorized: Only admins can create admin users");
    }

    // Create the user
    const userId = await ctx.db.insert("users", {
      isAdmin: args.isAdmin,
      createdAt: Date.now(),
    });
    return { success: true, userId };
  },
});

// Get all users (admin only)
export const getAllUsers = query({
  args: {
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Only admins can view all users
    if (!args.isAdmin) {
      throw new Error("Unauthorized: Only admins can view users");
    }

    return await ctx.db.query("users").collect();
  },
});

// Delete user (admin only)
export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Only admins can delete users
    if (!args.isAdmin) {
      throw new Error("Unauthorized: Only admins can delete users");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Don't allow deleting the last admin
    if (user.isAdmin) {
      const adminUsers = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("isAdmin"), true))
        .collect();
      
      if (adminUsers.length <= 1) {
        throw new Error("Cannot delete the last admin user");
      }
    }

    // 1. Get all messages by this user
    const userMessages = await ctx.db
      .query("messages")
      .withIndex("by_user")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    // 2. Delete all reactions made by this user
    const userReactions = await ctx.db
      .query("reactions")
      .withIndex("by_user")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    
    for (const reaction of userReactions) {
      await ctx.db.delete(reaction._id);
    }

    // 3. Get all reactions to the user's messages and delete them
    for (const message of userMessages) {
      const messageReactions = await ctx.db
        .query("reactions")
        .withIndex("by_message")
        .filter((q) => q.eq(q.field("messageId"), message._id))
        .collect();
      
      for (const reaction of messageReactions) {
        await ctx.db.delete(reaction._id);
      }

      // 4. Delete attached files from storage if any
      if (message.imageUrls?.length) {
        for (const image of message.imageUrls) {
          await ctx.storage.delete(image.storageId);
        }
      }

      // 5. Delete the message
      await ctx.db.delete(message._id);
    }

    // 6. Finally delete the user
    await ctx.db.delete(args.userId);
    return { success: true };
  },
});
