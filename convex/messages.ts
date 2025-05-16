import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all messages, sorted by creation time (oldest first)
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_timestamp")
      .order("asc")
      .collect();
  },
});

// Get pinned messages first, then regular messages
export const getAllWithPinnedFirst = query({
  args: {},
  handler: async (ctx) => {
    // Get pinned messages first
    const pinnedMessages = await ctx.db
      .query("messages")
      .withIndex("by_pinned")
      .filter((q) => q.eq(q.field("isPinned"), true))
      .order("asc")
      .collect();

    // Get non-pinned messages
    const regularMessages = await ctx.db
      .query("messages")
      .withIndex("by_pinned")
      .filter((q) => q.eq(q.field("isPinned"), false))
      .order("asc")
      .collect();

    return [...pinnedMessages, ...regularMessages];
  },
});

// Add a new message
export const add = mutation({
  args: {
    author: v.string(),
    content: v.string(),
    imageUrls: v.optional(v.array(v.object({
      storageId: v.id('_storage'),
      url: v.string()
    }))),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      author: args.author,
      content: args.content,
      imageUrls: args.imageUrls,
      createdAt: Date.now(),
      isPinned: false,
      userId: args.userId,
    });
    return messageId;
  },
});

// Toggle pin status of a message (admin only)
export const togglePin = mutation({
  args: {
    messageId: v.id("messages"),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Only admins can pin messages
    if (!args.isAdmin) {
      throw new Error("Unauthorized: Only admins can pin messages");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    await ctx.db.patch(args.messageId, {
      isPinned: !message.isPinned,
    });

    return !message.isPinned;
  },
});

// Update a message
export const update = mutation({
  args: {
    messageId: v.id("messages"),
    author: v.string(),
    content: v.string(),
    imageUrls: v.optional(v.array(v.object({
      storageId: v.id('_storage'),
      url: v.string()
    }))),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get the message to check ownership
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Only the original author can update the message
    if (message.userId !== args.userId) {
      throw new Error("Unauthorized: You can only update your own messages");
    }

    // Update the message
    await ctx.db.patch(args.messageId, {
      author: args.author,
      content: args.content,
      imageUrls: args.imageUrls,
      updatedAt: Date.now(),
    });

    return true;
  },
});

// Delete a message (admin only)
export const remove = mutation({
  args: {
    messageId: v.id("messages"),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Only admins can delete messages
    if (!args.isAdmin) {
      throw new Error("Unauthorized: Only admins can delete messages");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Delete any associated images from storage
    if (message.imageUrls && message.imageUrls.length > 0) {
      await Promise.all(
        message.imageUrls.map((img) => ctx.storage.delete(img.storageId))
      );
    }

    await ctx.db.delete(args.messageId);
    return true;
  },
});

// Delete a message (for users to delete their own messages)
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Only allow deletion if the user is the author
    if (message.userId !== args.userId) {
      throw new Error("Unauthorized: You can only delete your own messages");
    }

    // Delete any associated images from storage
    if (message.imageUrls && message.imageUrls.length > 0) {
      await Promise.all(
        message.imageUrls.map((img) => ctx.storage.delete(img.storageId))
      );
    }

    await ctx.db.delete(args.messageId);
    return true;
  },
});
