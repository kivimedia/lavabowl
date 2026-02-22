import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono();
app.all("/api/health", (c) => c.json({ status: "ok", ts: Date.now() }));
app.all("/api/*", (c) => c.json({ msg: "api works", path: c.req.path }));
app.all("*", (c) => c.json({ msg: "catch-all", path: c.req.path }));

export default handle(app);
