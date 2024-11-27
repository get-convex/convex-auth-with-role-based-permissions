import { Id } from "../_generated/dataModel";
import { QueryCtx, MutationCtx } from "../_generated/server";

export type Role = (typeof VALID_ROLES)[keyof typeof VALID_ROLES];

export const VALID_ROLES = {
  READ: "read",
  WRITE: "write",
  ADMIN: "admin",
} as const;

const roleHierarchy: Record<Role, number> = {
  read: 0,
  write: 1,
  admin: 2,
};

export async function checkPermission(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  requiredRole: Role,
): Promise<boolean> {
  const user = await ctx.db.get(userId);

  /*
   * If the user doesn't exist, or the role is not valid, return false
   */
  if (!user || !user.role || !(user.role in roleHierarchy)) return false;

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}
