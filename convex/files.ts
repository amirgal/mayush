import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";


// Generate a URL for uploading a file
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Get a URL for downloading a file
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Validate file upload - check size and file type
export const validateFileUpload = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Get file metadata
    const metadata = await ctx.storage.getMetadata(args.storageId);
    
    // Check file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (metadata && metadata.size > MAX_SIZE) {
      // If file is too large, delete it and throw an error
      await ctx.storage.delete(args.storageId);
      throw new ConvexError({
        code: "PAYLOAD_TOO_LARGE",
        message: "File exceeds the maximum size of 5MB"
      });
    }
    
    // Check file type (only jpg/jpeg and png allowed)
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (metadata && !validTypes.includes(metadata.contentType || "")) {
      // If file type is not valid, delete it and throw an error
      await ctx.storage.delete(args.storageId);
      throw new ConvexError({
        code: "UNSUPPORTED_MEDIA_TYPE",
        message: "Only JPEG and PNG images are allowed"
      });
    }
    
    // Return the storage ID if validation passes
    return args.storageId;
  },
});
