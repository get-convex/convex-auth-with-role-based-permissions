# Welcome to your Convex + React (Vite) + Convex Auth app with role-based permissions

This is a [Convex](https://convex.dev/) project created with [`npm create convex`](https://www.npmjs.com/package/create-convex).

After the initial setup (<2 minutes) you'll have a working full-stack app using:

- Convex as your backend (database, server logic)
- [Convex Auth](https://labs.convex.dev/auth) for your authentication implementation
- [React](https://react.dev/) as your frontend (web page interactivity)
- [Vite](https://vitest.dev/) for optimized web hosting
- [Tailwind](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/) for building great looking accessible UI fast

## Role Based Permissions

This project implements a hierarchical role-based permission system that controls access to different features of the application. The system is built using Convex and consists of three permission levels:

- **READ**: Basic access level - can view messages
- **WRITE**: Intermediate access - can view and send messages
- **ADMIN**: Full access - can view, send, and delete messages

### Implementation Details

The permission system is implemented across several files:

#### 1. Schema Definition (`schema.ts`)

```typescript
users: defineTable({
  // ... other fields ...
  role: v.optional(
    v.union(v.literal("read"), v.literal("write"), v.literal("admin")),
  ),
});
```

#### 2. Permission Management (`lib/permissions.ts`)

The permissions system uses a numeric hierarchy to determine access levels:

```typescript
const roleHierarchy = {
  read: 0,
  write: 1,
  admin: 2,
};
```

#### 3. Authentication Integration (`auth.ts`)

New users are automatically assigned the READ role upon registration:

```typescript
async afterUserCreatedOrUpdated(ctx, args) {
  if (args.existingUserId) return;
  await ctx.db.patch(args.userId, {
    role: VALID_ROLES.READ,
  });
}
```

#### 4. Usage Example (`messages.ts`)

The permission system controls access to different operations:

```typescript
// Reading messages requires READ access
const hasAccess = await checkPermission(ctx, userId, VALID_ROLES.READ);

// Sending messages requires WRITE access
const hasAccess = await checkPermission(ctx, userId, VALID_ROLES.WRITE);

// Deleting messages requires ADMIN access
const hasAccess = await checkPermission(ctx, userId, VALID_ROLES.ADMIN);
```

### Security Considerations

- Role checks are performed server-side in Convex functions
- Role updates should be restricted to administrators in production
- The permission system is integrated with the authentication system
- Invalid or missing roles default to no access

## Get started

If you just cloned this codebase and didn't use `npm create convex`, run:

```
npm install
npm run dev
```

If you're reading this README on GitHub and want to use this template, run:

```
npm create convex@latest -- -t react-vite-convexauth-shadcn
```

## The app

The app is a basic multi-user chat. Walkthrough of the source code:

- [convex/auth.ts](./convex/auth.ts) configures the available authentication methods
- [convex/messages.ts](./convex/messages.ts) is the chat backend implementation
- [src/main.tsx](./src/main.tsx) is the frontend entry-point
- [src/App.tsx](./src/App.tsx) determines which UI to show based on the authentication state
- [src/SignInForm.tsx](./src/SignInForm.tsx) implements the sign-in UI
- [src/Chat/Chat.tsx](./src/Chat/Chat.tsx) is the chat frontend

## Configuring other authentication methods

To configure different authentication methods, see [Configuration](https://labs.convex.dev/auth/config) in the Convex Auth docs.

## Learn more

To learn more about developing your project with Convex, check out:

- The [Tour of Convex](https://docs.convex.dev/get-started) for a thorough introduction to Convex principles.
- The rest of [Convex docs](https://docs.convex.dev/) to learn about all Convex features.
- [Stack](https://stack.convex.dev/) for in-depth articles on advanced topics.

## Join the community

Join thousands of developers building full-stack apps with Convex:

- Join the [Convex Discord community](https://convex.dev/community) to get help in real-time.
- Follow [Convex on GitHub](https://github.com/get-convex/), star and contribute to the open-source implementation of Convex.
