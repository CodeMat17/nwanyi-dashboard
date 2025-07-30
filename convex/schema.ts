import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  carousel: defineTable({
    image: v.string(),
    title: v.string(),
    tag: v.string(),
  }),

  interviews: defineTable({
    name: v.string(),
    title: v.string(),
    position: v.string(),
    excerpt: v.string(),
    image: v.string(),
    imageId: v.id("_storage"),
    slug: v.string(),
    category: v.string(),
    date: v.string(),
    content: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_date", ["date"])
    .index("by_title", ["title"]),

  aboutImage: defineTable({
    imageId: v.id("_storage"),
    imageUrl: v.string(),
  }),

  mission: defineTable({
    title: v.string(),
    caption: v.string(),
    body: v.string(),
  }),

  guidingPrinciple: defineTable({
    title: v.string(),
    body: v.string(),
  }),

  essenceOfName: defineTable({
    title: v.string(),
    caption: v.string(),
    data: v.array(
      v.object({
        title: v.string(),
        body: v.string(),
      })
    ),
  }),

  ourJourney: defineTable({
    title: v.string(),
    caption: v.string(),
    journey: v.array(
      v.object({
        year: v.string(),
        title: v.string(),
        body: v.string(),
      })
    ),
  }),

  testimonial: defineTable({
    body: v.string(),
    name: v.string(),
    position: v.string(),
    caption: v.string(),
  }),

  partnershipSupport: defineTable({
    body: v.string(),
    title: v.string(),
  }),

  partnersLogo: defineTable({
    logos: v.string(),
    logoId: v.id("_storage"),
  }),

  schedule: defineTable({
    startTime: v.string(), // "08:00"
    endTime: v.string(), // "09:30"
    title: v.string(),
    description: v.string(),
  }),

  speakers: defineTable({
    name: v.string(),
    position: v.string(),
    bio: v.string(),
    image: v.string(),
    twitter: v.optional(v.string()),
    linkedin: v.optional(v.string()),
  }),

  news: defineTable({
    title: v.string(),
    excerpt: v.string(),
    date: v.string(),
    content: v.string(),
    category: v.string(),
    image: v.string(),
    imageId: v.id("_storage"),
    featured: v.optional(v.boolean()),
    slug: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_featured", ["featured"])
    .index("by_category", ["category"]),

  gallery: defineTable({
    image: v.string(), // URL of the image
    imageId: v.id("_storage"), // Storage ID for the image
  }).index("by_imageId", ["imageId"]),
});
