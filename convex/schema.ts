import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    author: v.string(),
    content: v.string(),
    imageUrl: v.optional(v.string()),
    createdAt: v.float64(),
    isPinned: v.boolean(),
    userId: v.id('users'),
  })
    .index("by_timestamp", ["createdAt"])
    .index("by_pinned", ["isPinned", "createdAt"])
    .index("by_user", ["userId"]),

  reactions: defineTable({
    messageId: v.id('messages'),
    emoji: v.string(),
    userId: v.id("users"),
  })
    .index("by_message", ["messageId"])
    .index("by_user", ["userId"])
    .index("by_message_emoji", ["messageId", "emoji"])
    .index("by_user_message_emoji", ["userId", "messageId", "emoji"]),

  users: defineTable({
    username: v.string(),
    displayName: v.string(),
    passwordHash: v.string(),
    isAdmin: v.boolean(),
    createdAt: v.number(),
  }).index("by_username", ["username"]),
});
