/**
 * Global error handler middleware for the Hono API.
 */

import type { Context, Next } from "hono";

export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    console.error("[error-handler]", error);

    // Don't leak internal error details to the client
    const message =
      error instanceof Error ? error.message : "Internal server error";

    const status =
      error instanceof Error && "status" in error
        ? (error as { status: number }).status
        : 500;

    return c.json(
      {
        error: status >= 500 ? "Internal server error" : message,
        ...(process.env.NODE_ENV === "development" && {
          details: message,
          stack: error instanceof Error ? error.stack : undefined,
        }),
      },
      status as 500
    );
  }
}
