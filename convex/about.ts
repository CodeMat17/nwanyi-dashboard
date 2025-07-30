import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAboutImage = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("aboutImage").first();
  },
});

// Mutation to update About image
export const updateAboutImage = mutation({
  args: {
    id: v.id("aboutImage"),
    newImageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) {
      throw new Error("About image not found");
    }

    const newImageUrl = await ctx.storage.getUrl(args.newImageId);
    if (!newImageUrl) {
      throw new Error("Failed to get URL for the new image");
    }

    await ctx.db.patch(args.id, {
      imageId: args.newImageId,
      imageUrl: newImageUrl,
    });

    if (current.imageId) {
      await ctx.storage.delete(current.imageId);
    }

    return { success: true, id: args.id };
  },
});

// Query to fetch Mission
export const getMission = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("mission").first();
  },
});

// Mutation to create or update Mission (singleton)
export const updateMission = mutation({
  args: {
    id: v.id("mission"),
    title: v.optional(v.string()),
    caption: v.optional(v.string()),
    body: v.optional(v.string()),
  },
  handler: async (ctx, { id, title, caption, body }) => {
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error("Event not found");
    }

    const updateFields: {
      title?: string;
      caption?: string;
      body?: string;
    } = {
      title: title?.trim() ? title : existing.title,
      caption: caption?.trim() ? caption : existing.caption,
      body: body?.trim() ? body : existing.body,
    };

    await ctx.db.patch(id, updateFields);
    return { updated: true, id };
  },
});

// Query to fetch Guiding Principle
export const getGuidingPrinciple = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("guidingPrinciple").first();
  },
});

// Query to fetch the latest Essence of Name
export const getLatestEssenceOfName = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("essenceOfName").first();
  },
});

// Query to fetch the latest Our Journey
export const getLatestOurJourney = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("ourJourney").first();
  },
});

// Query to fetch the Testimonial
export const getTestimonial = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("testimonial").first();
  },
});

// Mutation to create or update Guiding Principle (singleton)
export const updateGuidingPrinciple = mutation({
  args: {
    title: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.title || !args.body) {
      throw new Error("Missing required fields");
    }

    const existing = await ctx.db.query("guidingPrinciple").first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        body: args.body,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("guidingPrinciple", {
        title: args.title,
        body: args.body,
      });
    }
  },
});

export const updateEssenceOfName = mutation({
  args: {
    id: v.id("essenceOfName"),
    title: v.optional(v.string()),
    caption: v.optional(v.string()),
    data: v.optional(
      v.array(
        v.object({
          title: v.string(),
          body: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;

    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Essence of Name not found");

    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([, val]) => val !== undefined)
    ) as Partial<typeof updateData>;

    if (Object.keys(cleanUpdateData).length > 0) {
      return await ctx.db.patch(id, cleanUpdateData);
    }

    return { updated: false, reason: "No fields provided for update" };
  },
});


export const updateOurJourney = mutation({
  args: {
    id: v.id("ourJourney"),
    title: v.optional(v.string()),
    caption: v.optional(v.string()),
    journey: v.optional(
      v.array(
        v.object({
          year: v.string(),
          title: v.string(),
          body: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;

    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Our Journey not found");

    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([, val]) => val !== undefined)
    ) as Partial<typeof updateData>;

    if (Object.keys(cleanUpdateData).length > 0) {
      await ctx.db.patch(id, cleanUpdateData);
      return { updated: true, id };
    }

    return { updated: false, reason: "No fields provided for update" };
  },
});

export const updateTestimonial = mutation({
  args: {
    id: v.id("testimonial"),
    body: v.optional(v.string()),
    name: v.optional(v.string()),
    position: v.optional(v.string()),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;

    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Testimonial not found");

    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([, val]) => val !== undefined)
    ) as Partial<typeof updateData>;

    if (Object.keys(cleanUpdateData).length > 0) {
      return await ctx.db.patch(id, cleanUpdateData);
    }

    return { updated: false, reason: "No fields provided for update" };
  },
});



