import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getSpeakers = query({
  handler: async (ctx) => {
    return await ctx.db.query("speakers").collect();
  },
});

export const createSpeaker = mutation({
  args: {
    name: v.string(),
    position: v.string(),
    bio: v.string(),
    twitter: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    imageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const imageUrl = await ctx.storage.getUrl(args.imageId);
    if (!imageUrl) {
      throw new Error("Failed to get URL for the uploaded image");
    }

    await ctx.db.insert("speakers", {
      name: args.name,
      position: args.position,
      bio: args.bio,
      twitter: args.twitter,
      linkedin: args.linkedin,
      image: imageUrl,
    });
  },
});

export const updateSpeaker = mutation({
  args: {
    id: v.id("speakers"),
    name: v.string(),
    position: v.string(),
    bio: v.string(),
    twitter: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) {
      throw new Error("Speaker not found");
    }

    let image = current.image;

    if (args.imageId) {
      const imageUrl = await ctx.storage.getUrl(args.imageId);
      if (!imageUrl) {
        throw new Error("Failed to get URL for the new image");
      }
      image = imageUrl;
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      position: args.position,
      bio: args.bio,
      twitter: args.twitter,
      linkedin: args.linkedin,
      image,
    });
  },
});

export const deleteSpeaker = mutation({
  args: {
    id: v.id("speakers"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
