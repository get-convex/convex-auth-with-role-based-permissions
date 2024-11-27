import GitHub from "@auth/core/providers/github";
import Resend from "@auth/core/providers/resend";
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { VALID_ROLES } from "./lib/permissions";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Configure authentication using Convex's auth system.
 * This setup enables:
 * - GitHub OAuth authentication
 * - Resend email authentication
 *
 * The exported functions (auth, signIn, signOut, store) can be used
 * in your frontend to manage authentication state.
 */
export const { auth, signIn, signOut, store } = convexAuth({
  providers: [GitHub, Resend],
  callbacks: {
    /**
     * This callback runs after a user signs in or updates their auth info.
     * We use it to set default permissions for new users.
     *
     * @param ctx - Convex context for database operations
     * @param args - Contains userId and flags for new/existing users
     */
    async afterUserCreatedOrUpdated(ctx, args) {
      // Skip if this is an existing user update
      if (args.existingUserId) return;

      // For new users, set their default role to READ
      await ctx.db.patch(args.userId, {
        role: VALID_ROLES.READ,
      });
    },
  },
});

/**
 * Query to get the currently authenticated user's data.
 * Returns null if no user is signed in.
 *
 * @example
 * // In your React component:
 * const me = useQuery(api.auth.getMe);
 * if (!me) return <SignInButton />;
 */
export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db.get(userId);
  },
});

/**
 * Mutation to update the current user's role.
 * This should typically be restricted to admin users in a real application.
 *
 * @throws Error if user is not signed in
 *
 * @example
 * // In your React component:
 * const updateRole = useMutation(api.auth.updateRole);
 * await updateRole({ role: "write" });
 */
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
