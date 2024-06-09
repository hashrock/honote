import { Hono } from "jsr:@hono/hono";
import { addMemo, getMemo, listMemo, updateMemo } from "./utils/db.ts";
import { deleteMemo } from "./utils/db.ts";

const memo = new Hono();

//list
memo.get("/", async (c) => c.json(await listMemo("1")));

//new
memo.post("/", async (c) => {
  const json = await c.req.json();
  const title = json.data.title;
  const body = json.data.body;
  const updatedAt = new Date();

  await addMemo("1", title, body);
  return c.json({ title, body, updatedAt });
});

//show
memo.get("/:id", async (c) => {
  const id = c.req.param("id");
  return c.json(await getMemo("1", id));
});

//update
memo.put("/:id", async (c) => {
  const id = c.req.param("id");
  const json = await c.req.json();
  const title = json.data.title;
  const body = json.data.body;

  await updateMemo("1", id, title, body);
  const updatedAt = new Date();
  return c.json({ title, body, updatedAt });
});

memo.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await deleteMemo("1", id);
  return c.json({ message: "deleted" });
});

export { memo };
