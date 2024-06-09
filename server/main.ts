import { Hono } from "jsr:@hono/hono";
import { serveStatic } from "jsr:@hono/hono/deno";
import { memo } from "./memo.ts";
const app = new Hono();

app.route("/api/memo", memo);
app.use("/*", serveStatic({ root: "./static" }));
Deno.serve(app.fetch);
