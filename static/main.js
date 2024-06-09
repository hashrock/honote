const editorEl = document.querySelector("#editor");
const documentIdEl = document.querySelector("#documentId");
const titleEl = document.querySelector("#title");

const saveEl = document.querySelector("#save");
const deleteEl = document.querySelector("#delete");
const updatedAtEl = document.querySelector("#updatedAt");

function clear() {
  titleEl.value = "";
  editorEl.value = "";
  documentIdEl.value = "";
  updatedAtEl.textContent = "";
}

saveEl.addEventListener("click", async () => {
  if (documentIdEl.value) {
    //update
    const data = {
      title: titleEl.value,
      body: editorEl.value,
    };

    const res = await fetch(`/memo/${documentIdEl.value}`, {
      method: "PUT",
      body: JSON.stringify({ data }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await res.json();
    const updatedAt = new Date(result.updatedAt);
    updatedAtEl.textContent = updatedAt.toLocaleString();
  } else {
    //create
    const data = {
      title: titleEl.value,
      body: editorEl.value,
    };

    const res = await fetch("/memo", {
      method: "POST",
      body: JSON.stringify({ data }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const resjson = await res.json();
    const updatedAt = new Date(resjson.updatedAt);
    updatedAtEl.textContent = updatedAt.toLocaleString();
  }
  await loadMemo();
});

deleteEl.addEventListener("click", async () => {
  if (documentIdEl.value) {
    const res = await fetch(`/memo/${documentIdEl.value}`, {
      method: "DELETE",
    });
    const result = await res.json();
    console.log(result);
    clear();

    await loadMemo();
  }
});

const selectEl = document.querySelector("#list");

selectEl.addEventListener("change", async (e) => {
  clear();
  const id = e.target.value;
  const res = await fetch(`/memo/${id}`);
  const data = await res.json();
  titleEl.value = data.title;
  editorEl.value = data.body;
  documentIdEl.value = data.id;
});

async function loadMemo() {
  const res = await fetch("/memo");
  const data = await res.json();

  selectEl.innerHTML = "";
  data.forEach((memo) => {
    const option = document.createElement("option");
    option.textContent = memo.title;
    option.value = memo.id;
    selectEl.appendChild(option);
  });
}

loadMemo();
