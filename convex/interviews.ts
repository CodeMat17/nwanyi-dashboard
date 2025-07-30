// convex/interview.ts (continued)
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getInterviews = query({
  handler: async (ctx) => {
    return await ctx.db.query("interviews").order("desc").collect();
  },
});

export const getInterviewBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const interview = await ctx.db
      .query("interviews")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!interview) return null;

    // Convert imageId to URL if needed
    const imageUrl = await ctx.storage.getUrl(interview.imageId);
    return { ...interview, image: imageUrl };
  },
});

export const createInterview = mutation({
  args: {
    name: v.string(),
    title: v.string(),
    position: v.string(),
    excerpt: v.string(),
    imageId: v.id("_storage"),
    category: v.string(),
    date: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const existingInterview = await ctx.db
      .query("interviews")
      .withIndex("by_title", (q) => q.eq("title", args.title))
      .unique();
    if (existingInterview) {
      throw new Error("An interview with this title already exists");
    }

    const imageUrl = await ctx.storage.getUrl(args.imageId);
    if (!imageUrl) {
      throw new Error("Invalid image ID");
    }

    const slug = args.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    await ctx.db.insert("interviews", {
      ...args,
      image: imageUrl,
      slug,
    });
  },
});

export const updateInterview = mutation({
  args: {
    id: v.id("interviews"),
    name: v.optional(v.string()),
    title: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    position: v.optional(v.string()),
    category: v.optional(v.string()),
    date: v.optional(v.string()),
    content: v.optional(v.string()),
    imageId: v.id("_storage"), // Now required
  },
  handler: async (ctx, args) => {
    const currentInterview = await ctx.db.get(args.id);
    if (!currentInterview) {
      throw new Error("Interview not found");
    }

    if (args.title && args.title !== currentInterview.title) {
      const existingInterview = await ctx.db
        .query("interviews")
        .withIndex("by_title", (q) => q.eq("title", args.title!))
        .unique();
      if (existingInterview && existingInterview._id !== args.id) {
        throw new Error("An interview with this title already exists");
      }
    }

    const imageUrl = await ctx.storage.getUrl(args.imageId);
    if (!imageUrl) {
      throw new Error("Invalid image ID");
    }

    const updateData: Partial<typeof currentInterview> = {
      name: args.name,
      title: args.title,
      excerpt: args.excerpt,
      position: args.position,
      category: args.category,
      date: args.date,
      content: args.content,
      imageId: args.imageId,
      image: imageUrl,
      slug: args.title
        ? args.title
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "")
        : undefined,
    };

    // Remove undefined fields to avoid setting them in the database
    Object.keys(updateData).forEach(
      (key) =>
        updateData[key as keyof typeof updateData] === undefined &&
        delete updateData[key as keyof typeof updateData]
    );

    await ctx.db.patch(args.id, updateData);
  },
});

export const deleteInterview = mutation({
  args: { id: v.id("interviews") },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.id);
    if (!interview) {
      throw new Error("Interview not found");
    }

    if (interview.imageId) {
      await ctx.storage.delete(interview.imageId);
    }

    await ctx.db.delete(args.id);
  },
});

export const latestInterviews = query({
  args: {},
  handler: async (ctx) => {
    const interviews = await ctx.db
      .query("interviews")
      .order("desc") // Sort by _creationTime or date in descending order
      .take(3); // Limit to 3 interviews

    // Resolve image URLs for each interview
    const interviewsWithImages = await Promise.all(
      interviews.map(async (interview) => {
        const imageUrl = await ctx.storage.getUrl(interview.imageId);
        return { ...interview, image: imageUrl || "" };
      })
    );

    return interviewsWithImages;
  },
});