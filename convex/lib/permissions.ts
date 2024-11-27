import { Id } from "../_generated/dataModel";
import { QueryCtx, MutationCtx } from "../_generated/server";

/**
 * Role type represents the possible permission levels in the system.
 * It is derived from the keys of VALID_ROLES.
 */
export type Role = (typeof VALID_ROLES)[keyof typeof VALID_ROLES];

/**
 * Valid roles in the system, in order of increasing privileges:
 * - READ: Can only view data
 * - WRITE: Can view and modify data
 * - ADMIN: Has full system access
 */
export const VALID_ROLES = {
  READ: "read",
  WRITE: "write",
  ADMIN: "admin",
} as const;

/**
 * Defines the hierarchy of roles using numeric values.
 * Higher numbers represent more privileges.
 * This allows for easy comparison of role levels using simple numeric comparison.
 */
const roleHierarchy: Record<Role, number> = {
  read: 0,
  write: 1,
  admin: 2,
};

/**
 * Checks if a user has sufficient permissions for a required role.
 *
 * @param ctx - The Convex context (works with both Query and Mutation contexts)
 * @param userId - The ID of the user to check permissions for
 * @param requiredRole - The minimum role level required for the operation
 * @returns Promise<boolean> - True if the user has sufficient permissions, false otherwise
 *
 * @example
 * // Check if a user has write permissions
 * const canWrite = await checkPermission(ctx, userId, "write");
 * if (!canWrite) throw new Error("Insufficient permissions");
 */
export async function checkPermission(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  requiredRole: Role,
): Promise<boolean> {
  const user = await ctx.db.get(userId);

  /*
   * If the user doesn't exist, or the role is not valid, return false
   * This handles cases where:
   * 1. The user ID is invalid or the user was deleted
   * 2. The user object doesn't have a role field
   * 3. The user's role is not one of the valid roles
   */
  if (!user || !user.role || !(user.role in roleHierarchy)) return false;

  // Compare the user's role level against the required role level
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}
