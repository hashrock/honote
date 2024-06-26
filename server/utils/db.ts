import { Memo, User } from "./types.ts";
const kv = await Deno.openKv();
import { ulid } from "jsr:@std/ulid";

export async function setUserWithSession(user: User, session: string) {
  await kv
    .atomic()
    .set(["users", user.id], user)
    .set(["users_by_login", user.login], user)
    .set(["users_by_session", session], user)
    .set(["users_by_last_signin", new Date().toISOString(), user.id], user)
    .commit();
}

export async function getUserBySession(session: string) {
  const res = await kv.get<User>(["users_by_session", session]);
  return res.value;
}

export async function getUserById(id: string) {
  const res = await kv.get<User>(["users", id]);
  return res.value;
}

export async function getUserByLogin(login: string) {
  const res = await kv.get<User>(["users_by_login", login]);
  return res.value;
}

export async function deleteSession(session: string) {
  await kv.delete(["users_by_session", session]);
}

export async function addMemo(uid: string, title: string, body: string) {
  const id = ulid();

  const memo: Memo = {
    id,
    title,
    body,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await kv.set(["memos", uid, id], memo);
  return memo;
}

export async function listMemo(uid: string) {
  const iter = await kv.list<Memo>({ prefix: ["memos", uid] });
  const memos: Memo[] = [];
  for await (const item of iter) {
    memos.push(item.value);
  }
  return memos;
}

export async function getMemo(uid: string, id: string) {
  const res = await kv.get<Memo>(["memos", uid, id]);
  return res.value;
}

export async function updateMemo(
  uid: string,
  id: string,
  title: string,
  body: string,
) {
  const memo = await getMemo(uid, id);
  if (!memo) throw new Error("memo not found");
  memo.title = title;
  memo.body = body;
  memo.updatedAt = new Date();
  await kv.set(["memos", uid, id], memo);
}

export async function deleteMemo(uid: string, id: string) {
  await kv.delete(["memos", uid, id]);
}

export async function listRecentlySignedInUsers(): Promise<User[]> {
  const users = [];
  const iter = kv.list<User>(
    { prefix: ["users_by_last_signin"] },
    {
      limit: 10,
      reverse: true,
    },
  );
  for await (const { value } of iter) {
    users.push(value);
  }
  return users;
}
