import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add a reaction to a message
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
      .withIndex("by_user_message_emoji", (q) => 
        q
          .eq("userId", args.userId)
          .eq("messageId", args.messageId)
          .eq("emoji", args.emoji)
      )
      .first();

    // If the user has already reacted with this emoji, do nothing
    if (existingUserReaction) {
      return existingUserReaction._id;
    }

    // Create a new reaction
    return await ctx.db.insert("reactions", {
      messageId: args.messageId,
      emoji: args.emoji,
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

// Get all reactions for a specific message with counts
export const getForMessage = query({
  args: {
    messageId: v.id("messages"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Get all reactions for this message
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .collect();
    
    // Group reactions by emoji and count them
    const emojiCounts = new Map();
    
    for (const reaction of reactions) {
      const { emoji } = reaction;
      
      if (!emojiCounts.has(emoji)) {
        emojiCounts.set(emoji, {
          emoji,
          count: 0,
          userReacted: false,
          reactions: [],
        });
      }
      
      const emojiData = emojiCounts.get(emoji);
      emojiData.count++;
      emojiData.reactions.push(reaction);
      
      // Check if the current user has reacted with this emoji
      if (args.userId && reaction.userId === args.userId) {
        emojiData.userReacted = true;
      }
    }
    
    // Convert map to array for return
    return Array.from(emojiCounts.values());
  },
});
