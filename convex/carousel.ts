import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const addCarousel = mutation({
  args: {
    imageId: v.id("_storage"),
    title: v.string(),
    tag: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.imageId || !args.title || !args.tag) {
      throw new Error("All fields are required");
    }

    const imageUrl = await ctx.storage.getUrl(args.imageId);
    if (!imageUrl) {
      throw new Error("Image not found");
    }

    await ctx.db.insert("carousel", {
      image: imageUrl,
      title: args.title,
      tag: args.tag,
    });
  },
});

export const getCarouselItems = query({
  handler: async (ctx) => {
    return await ctx.db.query("carousel").collect();
  },
});

export const deleteCarousel = mutation({
  args: {
    id: v.id("carousel"),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Extract storage ID from the URL more reliably
      const url = new URL(args.imageUrl);
      const pathParts = url.pathname.split("/");
      const storageId = pathParts[pathParts.length - 1] as Id<"_storage">;

      // Delete from storage first
      await ctx.storage.delete(storageId);

      // Then delete from database
      await ctx.db.delete(args.id);

      return { success: true };
    } catch (error) {
      console.error("Delete failed:", error);
      // Try to delete from DB even if storage deletion fails
      await ctx.db.delete(args.id).catch(() => {});
      throw new Error("Failed to delete carousel item");
    }
  },
});

// convex/carousel.ts
export const updateCarousel = mutation({
  args: {
    id: v.id("carousel"),
    title: v.optional(v.string()),  // Make both fields optional
    tag: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Only update the fields that were provided
    const updateData: {title?: string, tag?: string} = {};
    if (args.title !== undefined) updateData.title = args.title;
    if (args.tag !== undefined) updateData.tag = args.tag;
    
    await ctx.db.patch(args.id, updateData);
  },
});