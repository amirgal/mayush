import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Verify username and password
export const verifyCredentials = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username")
      .filter((q) => q.eq(q.field("username"), args.username))
      .first();

    if (!user) {
      return { success: false, isAdmin: false, message: "User not found" };
    }

    // In a real app, this would use proper password hashing
    if (user.passwordHash !== args.password) {
      return { success: false, isAdmin: false, message: "Invalid password" };
    }

    return {
      success: true,
      isAdmin: user.isAdmin,
    };
  },
});

// Register a new user
export const registerUser = mutation({
  args: {
    username: v.string(),
    password: v.string(),
    isAdmin: v.boolean(),
    adminRequest: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Only admins can create admin users
    if (args.isAdmin && !args.adminRequest) {
      throw new Error("Unauthorized: Only admins can create admin users");
    }

    // Check if username already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_username")
      .filter((q) => q.eq(q.field("username"), args.username))
      .first();

    if (existingUser) {
      return { success: false, message: "Username already exists" };
    }

    // Create the user
    const userId = await ctx.db.insert("users", {
      username: args.username,
      // In a real app, this would be properly hashed
      passwordHash: args.password,
      isAdmin: args.isAdmin,
      createdAt: Date.now(),
    });

    return { success: true, userId };
  },
});

// Initialize the system with an admin user if none exists
export const initializeSystem = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if any users exist
    const existingUsers = await ctx.db.query("users").collect();
    
    if (existingUsers.length === 0) {
      // Create default admin user
      await ctx.db.insert("users", {
        username: "admin",
        // In a real app, this would be properly hashed
        passwordHash: "admin123",
        isAdmin: true,
        createdAt: Date.now(),
      });

      return { initialized: true };
    }

    return { initialized: false };
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
