// Vercel Serverless Function Entry Point
// Uses the full Hono app from server/src/app.ts with manual Node.js adapter
// (hono/vercel handle() causes FUNCTION_INVOCATION_TIMEOUT)

import { app } from "../server/src/app.js";

export default async function handler(req: any, res: any) {
  try {
    // Build a Web Request from Node.js IncomingMessage
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const url = new URL(req.url || "/", `${protocol}://${host}`);

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) headers.set(key, Array.isArray(value) ? value.join(", ") : value as string);
    }

    let body: ReadableStream | null = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(Buffer.from(chunk));
      }
      const bodyBuffer = Buffer.concat(chunks);
      if (bodyBuffer.length > 0) {
        body = new ReadableStream({
          start(controller) {
            controller.enqueue(new Uint8Array(bodyBuffer));
            controller.close();
          },
        });
      }
    }

    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body,
      // @ts-ignore - duplex required for streaming request bodies
      duplex: body ? "half" : undefined,
    });

    // Call Hono's fetch handler
    const response = await app.fetch(request);

    // Convert Web Response to Node.js response
    res.status(response.status);
    response.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value);
    });

    const responseBody = await response.arrayBuffer();
    res.end(Buffer.from(responseBody));
  } catch (err: any) {
    console.error("Vercel handler error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "production" ? "An error occurred" : err.message,
    });
  }
}
