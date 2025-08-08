// convex/nominations.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// convex/nominations.ts
export const getNominations = query({
  args: {}, // Make args optional
  handler: async (ctx) => {
    return await ctx.db.query("nominations").order("desc").collect();
  },
});

export const createNomination = mutation({
  args: {
    nominator: v.object({
      fullName: v.string(),
      email: v.string(),
      phone: v.string(),
    }),
    nominee: v.object({
      fullName: v.string(),
      title: v.string(),
      email: v.string(),
      phone: v.string(),
      reason: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    try {
      // Validate email formats
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (
        !emailRegex.test(args.nominator.email) ||
        !emailRegex.test(args.nominee.email)
      ) {
        throw new Error("Invalid email format");
      }

      // Validate phone numbers
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (
        !phoneRegex.test(args.nominator.phone) ||
        !phoneRegex.test(args.nominee.phone)
      ) {
        throw new Error("Invalid phone number format");
      }

      // Validate reason length
      if (args.nominee.reason.length < 50 || args.nominee.reason.length > 500) {
        throw new Error("Reason must be between 50-500 characters");
      }

      await ctx.db.insert("nominations", {
        nominator: args.nominator,
        nominee: args.nominee,
      });
      return { success: true };
    } catch (error) {
      console.error("Error creating nomination:", error);
      throw new Error("Failed to create nomination.");
    }
  },
});


export const deleteNomination = mutation({
  args: {
    id: v.id("nominations"),
  },
  handler: async (ctx, args) => {
    const nomination = await ctx.db.get(args.id);
    if (!nomination) {
      throw new Error("Nomination not found");
    }
    await ctx.db.delete(args.id);
  },
});

