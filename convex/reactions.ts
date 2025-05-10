import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add or update a reaction to a message
export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if the user has already reacted with this emoji to this message
    const existingUserReaction = await ctx.db
      .query("reactions")
      .filter((q) => q.eq(q.field("messageId"), args.messageId))
      .filter((q) => q.eq(q.field("emoji"), args.emoji))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    // If the user has already reacted with this emoji, do nothing
    if (existingUserReaction) {
      return existingUserReaction._id;
    }

    // Create a new reaction
    return await ctx.db.insert("reactions", {
      messageId: args.messageId,
      emoji: args.emoji,
      count: 1,
      userId: args.userId,
    });
  },
});

// Remove a reaction from a message
export const removeReaction = mutation({
  args: {
    reactionId: v.id("reactions"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const reaction = await ctx.db.get(args.reactionId);
    
    // If reaction not found or user is not the owner, do nothing
    if (!reaction || reaction.userId !== args.userId) {
      return null;
    }
    
    // Remove the reaction entirely
    await ctx.db.delete(args.reactionId);
    
    return true;
  },
});

// Get all reactions for a specific message
export const getForMessage = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reactions")
      .filter((q) => q.eq(q.field("messageId"), args.messageId))
      .collect();
  },
});
