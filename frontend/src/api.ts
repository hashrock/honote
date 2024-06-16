export async function postMemo(title: string, body: string) {
  const data = {
    title,
    body,
  };
  const res = await fetch("/api/memo", {
    method: "POST",
    body: JSON.stringify({ data }),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());

  return await res.json();
}

export async function updateMemo(
  documentId: string,
  title: string,
  body: string,
) {
  const data = {
    title,
    body,
  };
  const res = await fetch(`/api/memo/${documentId}`, {
    method: "PUT",
    body: JSON.stringify({ data }),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());

  return await res.json();
}

export async function getMemo(selectedId: string) {
  const res = await fetch(`/api/memo/${selectedId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());

  const data = await res.json();
  return data;
}

export async function listMemo() {
  const res = await fetch("/api/memo", {
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());

  const data = await res.json();
  return data;
}

export async function deleteMemo(documentId: string) {
  const res = await fetch(`/api/memo/${documentId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());

  return await res.json();
}

export async function fetchUserData() {
  const res = await fetch("/api/user", {
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());

  const data = await res.json();
  return data.user;
}
