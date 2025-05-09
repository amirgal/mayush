import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    author: v.string(),
    content: v.string(),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    isPinned: v.boolean(),
  })
    .index("by_timestamp", ["createdAt"])
    .index("by_pinned", ["isPinned", "createdAt"]),

  reactions: defineTable({
    messageId: v.id("messages"),
    emoji: v.string(),
    count: v.number(),
  }).index("by_message", ["messageId"]),

  users: defineTable({
    username: v.string(),
    displayName: v.string(),
    passwordHash: v.string(),
    isAdmin: v.boolean(),
    createdAt: v.number(),
  }).index("by_username", ["username"]),
});
