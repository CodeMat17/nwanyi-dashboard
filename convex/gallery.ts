import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all gallery images
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("gallery").collect();
  },
});

// Add a new image to the gallery
export const addImage = mutation({
  args: {
    imageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const imageUrl = await ctx.storage.getUrl(args.imageId);
    if (!imageUrl) {
      throw new Error("Failed to get image URL");
    }

    await ctx.db.insert("gallery", {
      image: imageUrl,
      imageId: args.imageId,
    });
    return imageUrl;
  },
});

// Delete an image from the gallery
export const deleteImage = mutation({
  args: {
    imageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Find gallery item by imageId
    const galleryItem = await ctx.db
      .query("gallery")
      .withIndex("by_imageId", (q) => q.eq("imageId", args.imageId))
      .unique();

    if (!galleryItem) {
      throw new Error("Gallery item not found");
    }

    // Delete from storage
    await ctx.storage.delete(args.imageId);

    // Delete the gallery record
    await ctx.db.delete(galleryItem._id);
  },
});
