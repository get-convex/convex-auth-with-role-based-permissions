import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  /*
   * Replace the default users table from authTables so we can add our own fields
   * New fields must be optional if all of the OAuth providers don't return them
   */
  users: defineTable({
    /*
     * we use the tokenIdentifier to fetch a user's role, because the document _id of
     * the user in Convex may change (if the user is deleted and re-created, for example)
     * while the tokenIdentifier is constant for the same user across OAuth providers
     */
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.float64()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.float64()),
    isAnonymous: v.optional(v.boolean()),

    /*
     * must be optional because OAuth providers don't return a role
     */
    role: v.optional(
      v.union(v.literal("read"), v.literal("write"), v.literal("admin")),
    ),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),
  messages: defineTable({
    body: v.string(),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),
});
