import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all reactions for a message
export const getForMessage = query({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reactions")
      .withIndex("by_message")
      .filter((q) => q.eq(q.field("messageId"), args.messageId))
      .collect();
  },
});

// Add or update a reaction to a message
export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if this reaction already exists
    const existingReaction = await ctx.db
      .query("reactions")
      .withIndex("by_message")
      .filter((q) => 
        q.and(
          q.eq(q.field("messageId"), args.messageId),
          q.eq(q.field("emoji"), args.emoji)
        )
      )
      .first();

    if (existingReaction) {
      // Update the count
      await ctx.db.patch(existingReaction._id, {
        count: existingReaction.count + 1,
      });
      return existingReaction._id;
    } else {
      // Create a new reaction
      return await ctx.db.insert("reactions", {
        messageId: args.messageId,
        emoji: args.emoji,
        count: 1,
      });
    }
  },
});

// Remove a reaction from a message
export const removeReaction = mutation({
  args: {
    reactionId: v.id("reactions"),
  },
  handler: async (ctx, args) => {
    const reaction = await ctx.db.get(args.reactionId);
    
    if (!reaction) {
      throw new Error("Reaction not found");
    }
    
    if (reaction.count > 1) {
      // Decrease the count
      await ctx.db.patch(args.reactionId, {
        count: reaction.count - 1,
      });
    } else {
      // Remove the reaction entirely
      await ctx.db.delete(args.reactionId);
    }
    
    return true;
  },
});
