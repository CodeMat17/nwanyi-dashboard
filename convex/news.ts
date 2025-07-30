import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .substring(0, 60); // Limit length
}

// Get all articles
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("news").order("desc").collect();
  },
});

// Get featured articles
export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("news")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .order("desc")
      .collect();
  },
});

// Get article by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("news")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});

// Get articles by category
export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, { category }) => {
    return await ctx.db
      .query("news")
      .withIndex("by_category", (q) => q.eq("category", category))
      .order("desc")
      .collect();
  },
});

// Get all categories
export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const articles = await ctx.db.query("news").collect();
    const categories = new Set(articles.map((article) => article.category));
    return Array.from(categories);
  },
});

// Create a new article
export const create = mutation({
  args: {
    title: v.string(),
    excerpt: v.string(),
    content: v.string(),
    date: v.string(),
    category: v.string(),
    imageId: v.id("_storage"),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const slug = generateSlug(args.title);

    // Check for existing slug
    const existing = await ctx.db
      .query("news")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (existing) {
      throw new Error("Article with similar title already exists");
    }

    // Get the image URL
    const imageUrl = await ctx.storage.getUrl(args.imageId);
    if (!imageUrl) {
      throw new Error("Image not found in storage");
    }

    return await ctx.db.insert("news", {
      ...args,
      slug,
      image: imageUrl,
      date: new Date().toISOString(),
    });
  },
});

// Update an article
export const update = mutation({
  args: {
    id: v.id("news"),
    title: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, imageId, ...rest } = args;
    const currentArticle = await ctx.db.get(id);
    if (!currentArticle) {
      throw new Error("Article not found");
    }

    // Create typed update data object
    const updateData: {
      title?: string;
      excerpt?: string;
      content?: string;
      category?: string;
      featured?: boolean;
      image?: string;
      imageId?: Id<"_storage">;
      slug?: string;
    } = { ...rest };

    // Handle image update if new imageId provided
    if (imageId) {
      const imageUrl = await ctx.storage.getUrl(imageId);
      if (!imageUrl) {
        // Delete the new image if we can't get a URL
        await ctx.storage.delete(imageId);
        throw new Error("Failed to get URL for uploaded image");
      }
      updateData.image = imageUrl;
      updateData.imageId = imageId;

      // Delete old image if it exists and is different from new one
      if (currentArticle.imageId && currentArticle.imageId !== imageId) {
        await ctx.storage.delete(currentArticle.imageId).catch((error) => {
          console.error("Failed to delete old image:", error);
        });
      }
    }

    // Handle slug regeneration if title changed
    if (rest.title && rest.title !== currentArticle.title) {
      const newSlug = generateSlug(rest.title);

      const existing = await ctx.db
        .query("news")
        .withIndex("by_slug", (q) => q.eq("slug", newSlug))
        .unique();

      if (existing && existing._id.toString() !== id.toString()) {
        throw new Error("Article with similar title already exists");
      }
      updateData.slug = newSlug;
    }

    await ctx.db.patch(id, updateData);
    const updatedArticle = await ctx.db.get(id);
    if (!updatedArticle) {
      throw new Error("Failed to update article");
    }
    return updatedArticle;
  },
});

// Delete an article
export const remove = mutation({
  args: { id: v.id("news") },
  handler: async (ctx, { id }) => {
    const article = await ctx.db.get(id);
    if (!article) {
      throw new Error("Article not found");
    }

    // Delete the associated image from storage
    if (article.imageId) {
      await ctx.storage.delete(article.imageId);
    }

    await ctx.db.delete(id);
    return { success: true };
  },
});