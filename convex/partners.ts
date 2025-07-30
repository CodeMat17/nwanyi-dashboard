import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getPartnershipSupport = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("partnershipSupport").first();
  },
});

export const updatePartnershipSupport = mutation({
  args: {
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.title || !args.body) {
      throw new Error("Missing required fields");
    }

    const existing = await ctx.db.query("partnershipSupport").first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        body: args.body,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("partnershipSupport", {
        title: args.title,
        body: args.body,
      });
    }
  },
});

export const uploadLogo = mutation({
  args: {
    logoId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.logoId);
    if (!url) throw new Error("Failed to retrieve image URL");

    const inserted = await ctx.db.insert("partnersLogo", {
      logos: url,
      logoId: args.logoId,
    });

    return inserted;
  },
});

export const deleteLogo = mutation({
  args: {
    id: v.id("partnersLogo"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Logo not found");

    await ctx.storage.delete(existing.logoId);
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const getLogos = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("partnersLogo").collect();
  },
});