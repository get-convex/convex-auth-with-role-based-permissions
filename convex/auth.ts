import GitHub from "@auth/core/providers/github";
import Resend from "@auth/core/providers/resend";
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { VALID_ROLES } from "./lib/permissions";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [GitHub, Resend],
  callbacks: {
    /*
     * Use the available callback to add user defaults.
     * https://labs.convex.dev/auth/advanced#writing-additional-data-during-authentication
     */
    async afterUserCreatedOrUpdated(ctx, args) {
      if (args.existingUserId) return;
      await ctx.db.patch(args.userId, {
        role: VALID_ROLES.READ,
      });
    },
  },
});

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db.get(userId);
  },
});

export const updateRole = mutation({
  args: {
    role: v.union(v.literal("read"), v.literal("write"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");
    await ctx.db.patch(userId, { role: args.role });
  },
});
