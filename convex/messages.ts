import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { VALID_ROLES } from "./lib/permissions";
import { checkPermission } from "./lib/permissions";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Query to list the most recent messages with author information.
 * Requires READ permission or higher.
 *
 * @returns Array of messages with author details (name or email)
 * @throws Error if user is not signed in or has insufficient permissions
 *
 * @example
 * // In your React component:
 * const messages = useQuery(api.messages.list);
 * return messages.map(msg => <Message key={msg._id} {...msg} />);
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    // Verify user is authenticated
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");

    // Check if user has read permissions
    const hasAccess = await checkPermission(ctx, userId, VALID_ROLES.READ);
    if (!hasAccess) throw new Error("Insufficient permissions");

    // Fetch the 100 most recent messages
    const messages = await ctx.db.query("messages").order("desc").take(100);

    // Enrich messages with author information
    return Promise.all(
      messages.map(async (message) => {
        const { name, email } = (await ctx.db.get(message.userId))!;
        return { ...message, author: name ?? email! };
      }),
    );
  },
});

/**
 * Mutation to send a new message.
 * Requires WRITE permission or higher.
 *
 * @param body - The text content of the message
 * @throws Error if user is not signed in or has insufficient permissions
 *
 * @example
 * // In your React component:
 * const sendMessage = useMutation(api.messages.send);
 * await sendMessage({ body: "Hello, world!" });
 */
export const send = mutation({
  args: { body: v.string() },
  handler: async (ctx, { body }) => {
    // Verify user is authenticated
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");

    // Check if user has write permissions
    const hasAccess = await checkPermission(ctx, userId, VALID_ROLES.WRITE);
    if (!hasAccess) throw new Error("Insufficient permissions");

    // Create the new message
    await ctx.db.insert("messages", { body, userId });
  },
});

/**
 * Mutation to delete a message.
 * Requires ADMIN permission.
 *
 * @param messageId - The ID of the message to delete
 * @throws Error if user is not signed in or has insufficient permissions
 *
 * @example
 * // In your React component:
 * const deleteMsg = useMutation(api.messages.deleteMessage);
 * await deleteMsg({ messageId: message._id });
 */
export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, { messageId }) => {
    // Verify user is authenticated
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");

    // Check if user has admin permissions
    const hasAccess = await checkPermission(ctx, userId, VALID_ROLES.ADMIN);
    if (!hasAccess) throw new Error("Insufficient permissions");

    // Delete the message
    await ctx.db.delete(messageId);
  },
});
