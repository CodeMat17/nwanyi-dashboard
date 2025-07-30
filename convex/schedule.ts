import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSchedule = query({
  handler: async (ctx) => {
    const schedules = await ctx.db.query("schedule").collect();

    return schedules.sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );
  },
});

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}



export const uploadScheduleItem = mutation({
  args: {
    startTime: v.string(),
    endTime: v.string(),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("schedule", {
      startTime: args.startTime,
      endTime: args.endTime,
      title: args.title,
      description: args.description,
    });
  },
});

export const deleteScheduleItem = mutation({
  args: { id: v.id("schedule") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});


export const updateScheduleItem = mutation({
  args: {
    id: v.id("schedule"),
    title: v.string(),
    description: v.string(),
    startTime: v.string(),
    endTime: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
    });
  },
});
