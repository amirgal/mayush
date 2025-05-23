import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    author: v.string(),
    content: v.string(),
    imageUrls: v.optional(v.array(v.object({
      storageId: v.id('_storage'),
      url: v.string()
    }))),
    createdAt: v.float64(),
    updatedAt: v.optional(v.float64()),
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
    isAdmin: v.boolean(),
    createdAt: v.number(),
  }),
});
