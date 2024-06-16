import { Hono } from "jsr:@hono/hono";
import { addMemo, getMemo, listMemo, updateMemo } from "./utils/db.ts";
import { deleteMemo } from "./utils/db.ts";
import { createGitHubOAuthConfig, createHelpers } from "jsr:@deno/kv-oauth";
import { getUserBySession } from "./utils/db.ts";
import { loadSync } from "jsr:@std/dotenv";
import { HTTPException } from "jsr:@hono/hono/http-exception";
import { User } from "./utils/types.ts";

loadSync({
  export: true,
});

type Variables = {
  sessionId: string;
  user: User;
};

const memo = new Hono<{ Variables: Variables }>();

const { getSessionId } = createHelpers(
  createGitHubOAuthConfig(),
);

// Middleware
memo.use(async (c, next) => {
  const sessionId = await getSessionId(c.req.raw);

  if (!sessionId) {
    throw new HTTPException(401, { message: "not signed in" });
  }
  const user = await getUserBySession(sessionId);
  if (!user) {
    throw new HTTPException(403, { message: "failed to get user" });
  }

  c.set("sessionId", sessionId);
  c.set("user", user);
  await next();
});

//list
memo.get("/", async (c) => {
  const user = c.get("user");

  return c.json(await listMemo(user.id));
});

//new
memo.post("/", async (c) => {
  const user = c.get("user");
  const json = await c.req.json();
  const title = json.data.title;
  const body = json.data.body;

  const newMemo = await addMemo(user.id, title, body);
  return c.json(newMemo);
});

//show
memo.get("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  return c.json(await getMemo(user.id, id));
});

//update
memo.put("/:id", async (c) => {
  const user = c.get("user");

  const id = c.req.param("id");
  const json = await c.req.json();
  const title = json.data.title;
  const body = json.data.body;

  await updateMemo(user.id, id, title, body);
  const updatedAt = new Date();
  return c.json({ title, body, updatedAt });
});

memo.delete("/:id", async (c) => {
  const user = c.get("user");

  const id = c.req.param("id");
  await deleteMemo(user.id, id);
  return c.json({ message: "deleted" });
});

export { memo };
