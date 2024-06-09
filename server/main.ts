import { Hono } from "jsr:@hono/hono";
import { serveStatic } from "jsr:@hono/hono/deno";
import { api } from "./api.ts";

const app = new Hono();
app.route("/api", api);

app.use("/*", serveStatic({ root: "./static" }));
Deno.serve(app.fetch);
