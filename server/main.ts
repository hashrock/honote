import { Hono } from "jsr:@hono/hono";
import { serveStatic } from "jsr:@hono/hono/deno";
import { loadSync } from "jsr:@std/dotenv";
loadSync({
  export: true,
});

import { createGitHubOAuthConfig, createHelpers } from "jsr:@deno/kv-oauth";
import { memo } from "./memo.ts";
import { RedirectStatusCode } from "jsr:@hono/hono/utils/http-status";
import {
  getUserById,
  getUserBySession,
  setUserWithSession,
} from "./utils/db.ts";
import { getAuthenticatedUser } from "./utils/github.ts";
import { User } from "./utils/types.ts";

const app = new Hono();

app.route("/api/memo", memo);
const { signIn, handleCallback, signOut, getSessionId } = createHelpers(
  createGitHubOAuthConfig(),
);

app.get("/api/user", async (c) => {
  const sessionId = await getSessionId(c.req.raw);
  if (!sessionId) {
    return c.json({ status: "not signed in" });
  }

  const user = await getUserBySession(sessionId);

  return c.json({ user });
});

app.get("/api/signin", async (c) => {
  const response = await signIn(c.req.raw);

  c.header("set-cookie", response.headers.get("set-cookie")!);
  return c.redirect(
    response.headers.get("location")!,
    response.status as RedirectStatusCode,
  );
});

app.get("/api/callback", async (c) => {
  const { response, tokens, sessionId } = await handleCallback(c.req.raw);

  const ghUser = await getAuthenticatedUser(tokens!.accessToken);

  console.log(ghUser);

  if (!ghUser) {
    return c.json({ status: "failed to get user" });
  }

  const userInDb = await getUserById(String(ghUser.id));

  if (userInDb) {
    await setUserWithSession({
      id: String(ghUser.id),
      login: ghUser.login,
      name: ghUser.name,
      avatarUrl: ghUser.avatar_url,
    }, sessionId);
  } else {
    const user: User = {
      id: String(ghUser.id),
      name: ghUser.name,
      avatarUrl: ghUser.avatar_url,
      login: ghUser.login,
    };
    await setUserWithSession(user, sessionId);
  }

  c.header("set-cookie", response.headers.get("set-cookie")!);
  return c.redirect(
    response.headers.get("location")!,
    response.status as RedirectStatusCode,
  );
});

app.get("/api/signout", async (c) => {
  const response = await signOut(c.req.raw);
  c.header("set-cookie", response.headers.get("set-cookie")!);
  return c.redirect(
    response.headers.get("location")!,
    response.status as RedirectStatusCode,
  );
});

app.use("/*", serveStatic({ root: "./static" }));
Deno.serve(app.fetch);
