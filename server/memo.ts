import { Hono } from "jsr:@hono/hono";
import { addMemo, getMemo, listMemo, updateMemo } from "./utils/db.ts";
import { deleteMemo } from "./utils/db.ts";
import { createGitHubOAuthConfig, createHelpers } from "jsr:@deno/kv-oauth";
import { getUserBySession } from "./utils/db.ts";
import { loadSync } from "jsr:@std/dotenv";

loadSync({
  export: true,
});

const memo = new Hono();

const { getSessionId } = createHelpers(
  createGitHubOAuthConfig(),
);

//list
memo.get("/", async (c) => {
  const sessionId = await getSessionId(c.req.raw);
  if (!sessionId) {
    return c.json({ status: "not signed in" });
  }
  const user = await getUserBySession(sessionId);
  if (!user) {
    return c.json({ status: "not signed in" });
  }

  return c.json(await listMemo(user.id));
});

//new
memo.post("/", async (c) => {
  const sessionId = await getSessionId(c.req.raw);
  if (!sessionId) {
    return c.json({ status: "not signed in" });
  }
  const user = await getUserBySession(sessionId);
  if (!user) {
    return c.json({ status: "not signed in" });
  }

  const json = await c.req.json();
  const title = json.data.title;
  const body = json.data.body;

  const newMemo = await addMemo(user.id, title, body);
  return c.json(newMemo);
});

//show
memo.get("/:id", async (c) => {
  const sessionId = await getSessionId(c.req.raw);
  if (!sessionId) {
    return c.json({ status: "not signed in" });
  }
  const user = await getUserBySession(sessionId);
  if (!user) {
    return c.json({ status: "not signed in" });
  }

  const id = c.req.param("id");
  return c.json(await getMemo(user.id, id));
});

//update
memo.put("/:id", async (c) => {
  const sessionId = await getSessionId(c.req.raw);
  if (!sessionId) {
    return c.json({ status: "not signed in" });
  }
  const user = await getUserBySession(sessionId);
  if (!user) {
    return c.json({ status: "not signed in" });
  }

  const id = c.req.param("id");
  const json = await c.req.json();
  const title = json.data.title;
  const body = json.data.body;

  await updateMemo(user.id, id, title, body);
  const updatedAt = new Date();
  return c.json({ title, body, updatedAt });
});

memo.delete("/:id", async (c) => {
  const sessionId = await getSessionId(c.req.raw);
  if (!sessionId) {
    return c.json({ status: "not signed in" });
  }
  const user = await getUserBySession(sessionId);
  if (!user) {
    return c.json({ status: "not signed in" });
  }

  const id = c.req.param("id");
  await deleteMemo(user.id, id);
  return c.json({ message: "deleted" });
});

export { memo };
