import { NextResponse } from "next/server";

/**
 * Wraps an API route handler so unhandled errors become a clean JSON 500
 * instead of crashing the request. Logs the full error server-side.
 */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";

      if (message === "Unauthenticated") {
        return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
      }

      console.error("[api] Unhandled error:", err);
      return NextResponse.json(
        { error: "Internal server error", detail: message },
        { status: 500 }
      );
    }
  };
}
