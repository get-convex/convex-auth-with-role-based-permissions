import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { VALID_ROLES } from "./lib/permissions";
import { checkPermission } from "./lib/permissions";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");

    const hasAccess = await checkPermission(ctx, userId, VALID_ROLES.READ);
    if (!hasAccess) throw new Error("Insufficient permissions");

    const messages = await ctx.db.query("messages").order("desc").take(100);

    return Promise.all(
      messages.map(async (message) => {
        const { name, email } = (await ctx.db.get(message.userId))!;
        return { ...message, author: name ?? email! };
      }),
    );
  },
});

export const send = mutation({
  args: { body: v.string() },
  handler: async (ctx, { body }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");

    const hasAccess = await checkPermission(ctx, userId, VALID_ROLES.WRITE);
    if (!hasAccess) throw new Error("Insufficient permissions");

    // Send a new message.
    await ctx.db.insert("messages", { body, userId });
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, { messageId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");

    const hasAccess = await checkPermission(ctx, userId, VALID_ROLES.ADMIN);
    if (!hasAccess) throw new Error("Insufficient permissions");

    await ctx.db.delete(messageId);
  },
});
