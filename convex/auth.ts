import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel"; // Correct import for Id type
import bcrypt from "bcryptjs";
import { api } from "./_generated/api";

// Define the return type for insertUser, which will be the return type for registerUserAction's handler
type InsertUserResult = 
  | { success: true; userId: Id<"users"> } 
  | { success: false; message: string };

// Define the return type for verifyLoginAction
type VerifyLoginResult = 
  | { success: true; userId: Id<"users">; displayName: string; isAdmin: boolean } 
  | { success: false; message: string; isAdmin: false };

// Query: Get user by id
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  }
});

// Query: Get user by username (internal use for login action)
export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username") // Assuming an index "by_username" exists on the "username" field
      .filter((q) => q.eq(q.field("username"), args.username))
      .first();
    return user; // Returns the user object (which includes passwordHash) or null
  },
});

// Action: Verify login credentials (handles password comparison)
export const verifyLoginAction = action({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<VerifyLoginResult> => {
    const user = await ctx.runQuery(api.auth.getUserByUsername, { username: args.username });

    if (!user) {
      return { success: false, message: "User not found", isAdmin: false };
    }

    const isPasswordValid = await bcrypt.compare(args.password, user.passwordHash);

    if (!isPasswordValid) {
      return { success: false, message: "Invalid password", isAdmin: false };
    }

    return { success: true, userId: user._id, displayName: user.displayName, isAdmin: user.isAdmin };
  },
});

// Action: Register a new user (handles password hashing)
export const registerUserAction = action({
  args: {
    username: v.string(),
    displayName: v.string(),
    password: v.string(),
    isAdmin: v.boolean(),
    adminRequest: v.boolean(),
  },
  handler: async (ctx, args): Promise<InsertUserResult> => { // <<< ANNOTATION ADDED HERE
    const passwordHash = await bcrypt.hash(args.password, 10);
    return await ctx.runMutation(api.auth.insertUser, {
      username: args.username,
      displayName: args.displayName,
      passwordHash,
      isAdmin: args.isAdmin,
      adminRequest: args.adminRequest,
    }) as InsertUserResult;
  },
});

// Mutation: Insert user (no hashing)
export const insertUser = mutation({
  args: {
    username: v.string(),
    displayName: v.string(),
    passwordHash: v.string(),
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
      displayName: args.displayName,
      passwordHash: args.passwordHash,
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
