import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono().basePath("/api");

app.use(
  "*",
  cors({
    origin: [
      "https://lavabowl.com",
      "https://www.lavabowl.com",
      "http://localhost:8080",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString(), env: "vercel" })
);

app.all("/*", (c) =>
  c.json({ msg: "api works", path: c.req.path, method: c.req.method })
);

// Use manual fetch-to-response conversion instead of hono/vercel handle()
export default async function handler(req: any, res: any) {
  try {
    // Build a Request from the Node.js req
    const url = new URL(req.url || "/", `https://${req.headers.host || "localhost"}`);
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) headers.set(key, Array.isArray(value) ? value.join(", ") : value as string);
    }

    let body: ReadableStream | null = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      // Read the body
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(Buffer.from(chunk));
      }
      const bodyBuffer = Buffer.concat(chunks);
      if (bodyBuffer.length > 0) {
        body = new ReadableStream({
          start(controller) {
            controller.enqueue(bodyBuffer);
            controller.close();
          },
        });
      }
    }

    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body,
    });

    const response = await app.fetch(request);

    // Convert Hono Response to Node.js res
    res.status(response.status);
    response.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value);
    });
    const responseBody = await response.text();
    res.end(responseBody);
  } catch (err: any) {
    console.error("Handler error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
}
