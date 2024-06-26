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
import { Hono } from "jsr:@hono/hono";
import { HTTPException } from "jsr:@hono/hono/http-exception";

const api = new Hono();

api.route("/memo", memo);

// OAuth

const { signIn, handleCallback, signOut, getSessionId } = createHelpers(
  createGitHubOAuthConfig(),
);

api.get("/user", async (c) => {
  const sessionId = await getSessionId(c.req.raw);
  if (!sessionId) {
    throw new HTTPException(401, { message: "not signed in" });
  }

  const user = await getUserBySession(sessionId);

  return c.json({ user });
});

api.get("/signin", async (c) => {
  const response = await signIn(c.req.raw);

  c.header("set-cookie", response.headers.get("set-cookie")!);
  return c.redirect(
    response.headers.get("location")!,
    response.status as RedirectStatusCode,
  );
});

api.get("/callback", async (c) => {
  const { response, tokens, sessionId } = await handleCallback(c.req.raw);
  if (!sessionId) {
    throw new HTTPException(401, { message: "not signed in" });
  }

  const ghUser = await getAuthenticatedUser(tokens!.accessToken);
  if (!ghUser) {
    throw new HTTPException(403, { message: "failed to get user" });
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

api.get("/signout", async (c) => {
  const response = await signOut(c.req.raw);
  c.header("set-cookie", response.headers.get("set-cookie")!);
  return c.redirect(
    response.headers.get("location")!,
    response.status as RedirectStatusCode,
  );
});

export { api };
