import { currentUser } from "@clerk/nextjs/server";

/**
 * Server-side helper — returns the current Clerk user or null.
 * Usage: const user = await getCurrentUser();
 */
export async function getCurrentUser() {
  return currentUser();
}

/** Throws if the user is not authenticated (use in protected server actions). */
export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthenticated");
  return user;
}
